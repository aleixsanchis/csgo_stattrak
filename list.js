var SerialPort = require('serialport');
SerialPort.list(function (err, ports) {
	console.log("hola");
 	ports.forEach(function(port) {
    console.log(port.comName);
    console.log(port.pnpId);
    console.log(port.manufacturer);
  });
});