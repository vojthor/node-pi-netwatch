require("dotenv").config();

const nmap = require("node-nmap");
const JVSDisplayOTron = require("jvsdisplayotron");

const useDisplay = process.env.USE_DISPLAY;

if (useDisplay) {
  const dothat = new JVSDisplayOTron.DOTHAT();
  dothat.barGraph.setBrightness(0, 15);
  dothat.lcd.setContrast(45);
  dothat.backlight.setToHue(0.6);
  dothat.lcd.write("Scanning...");
}

nmap.nmapLocation = "nmap"; //default

const displayTotalDevices = (total) => {
  dothat.lcd.setCursorPosition(0, 2);
  dothat.lcd.write(`Online: ${total}`);
};

const waitFor = (ms) => new Promise((r) => setTimeout(r, ms));

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const displayIpAndHost = (host) => {
  dothat.lcd.setCursorPosition(0, 0);
  dothat.lcd.write(host.ip);
  dothat.lcd.setCursorPosition(0, 1);
  dothat.lcd.write(host.hostname ? host.hostname.replace(".lan", "") : " ");
};

const scanTheNetwork = async () => {
  return new Promise((resolve) => {
    console.log("new run");
    const quickscan = new nmap.QuickScan(process.env.LAN_IP);

    let blinkTimeout;
    let graphState = true;

    function blinkBlink() {
      blinkTimeout = setTimeout(() => {
        console.log("blink blink");
        dothat.barGraph.setByPercentage(graphState ? 100 : 0);
        graphState = !graphState;
        blinkBlink();
      }, 1000);
    }

    // blinkBlink();

    function cancelBlink() {
      clearTimeout(blinkTimeout);
    }

    quickscan.on("complete", async (data) => {
      await asyncForEach(data, async (host) => {
        await waitFor(6000);
        if (useDisplay) {
          dothat.lcd.clear();
          displayTotalDevices(data.length);
          displayIpAndHost(host);
        }
        console.log(host);
      });

      // cancelBlink();
      return scanTheNetwork();
    });

    quickscan.on("error", function (error) {
      console.log(error);
    });
  });
};

async function runTheStuff() {
  await scanTheNetwork();
}

runTheStuff();
