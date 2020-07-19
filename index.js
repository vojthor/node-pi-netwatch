const nmap = require('node-nmap');
 
nmap.nmapLocation = "nmap"; //default
 
//Accepts array or comma separated string of NMAP acceptable hosts
const quickscan = new nmap.QuickScan('192.168.1.0/24'); 
quickscan.startScan();

quickscan.on('complete', function(data){
    //console.log(data);
    data.forEach(host => {
        console.log(`${host.ip} - ${host.hostname}`);
    });
  });
   
  quickscan.on('error', function(error){
    console.log(error);
  });