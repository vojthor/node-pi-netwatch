require("dotenv").config();

/*
 * This example script allows you to register a phone number with Signal via
 * SMS and then send and receive a message. It uses the node-localstorage
 * module to save state information to a directory path supplied by the
 * environent variable 'STORE'.
 *
 * For example, with two numbers (by default this utilizes the Signal staging
 * server so it is safe to use without it clobbering your keys). The password
 * is an arbitrary string, it just must remain consistent between requests:
 *
 * # Request a verification code via SMS for the first number:
 * STORE=./first node ./example/client.js requestSMS +15555555555 <password>
 *
 * # Or via voice:
 * STORE=./first node ./example/client.js requestVoice +15555555555 <password>
 *
 * # You then receive an SMS to +15555555555 with the code. Verify it:
 * STORE=./first node ./example/client.js register +15555555555 <password> <CODE>
 *
 * # Repeat the process with a second number:
 * STORE=./second node ./example/client.js request +15555556666 <password>
 * STORE=./second node ./example/client.js register +15555556666 <password> <CODE>
 *
 * # Now in one terminal listen for messages with one number:
 * STORE=./first node ./example/client.js receive
 *
 * # And in another terminal send the that number a message:
 * STORE=./second node ./example/client.js send +15555555555 "PING"
 *
 * # In the first terminal you should see message output, including "PING"
 *
 * # To send a file, include the path after your message text:
 * STORE=./second node ./example/client.js send +15555555555 "PING" /tmp/foo.jpg
 *
 * # To update the expiration timer of a conversation:
 * STORE=./second node ./example/client.js expire +15555555555 <seconds>
 *
 */

const Signal = require("@throneless/libsignal-service");
const Storage = require("./LocalSignalProtocolStore.js");
const protocolStore = new Signal.ProtocolStore(new Storage("./storage"));
protocolStore.load();
const ByteBuffer = require("bytebuffer");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);

function printError(error) {
  console.log(error);
}

const myPhoneNumber = process.env.RPI_MOBILE;
const password = Signal.KeyHelper.generatePassword(); // A simple helper function to generate a random password.
const accountManager = new Signal.AccountManager(
  myPhoneNumber,
  password,
  protocolStore
); // The protocolStore from above

// accountManager.requestSMSVerification().then((result) => {
//   console.log("Sent verification code.");
// });

// accountManager.registerSingleDevice("954120").then((result) => {
//   console.log("Registered account.");
// });

const sendMsg = (msg) => {
  const messageSender = new Signal.MessageSender(protocolStore);
  messageSender.connect().then(() => {
    messageSender
      .sendMessageToNumber({
        number: process.env.EMERGENCY_MOBILE,
        body: msg,
      })
      .then((result) => {
        console.log(result);
      })
      .catch((e) => console.log(e));
  });
};

const client = {
  sendMsg,
};

module.exports = client;
