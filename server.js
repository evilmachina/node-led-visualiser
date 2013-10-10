"use strict";
var io = require('socket.io').listen(1337);
var LightStrips = require('./LPD8806').LightStrips;

var numberOfLEDs = 54;
var lights = new LightStrips('/dev/spidev0.0', numberOfLEDs);

var xbeeSerialPort = '/dev/serial/by-id/usb-Arduino__www.arduino.cc__Arduino_Mega_2560_64932343638351D0C241-if00';

var serialport = require('serialport');
var serialPort = new serialport.SerialPort(xbeeSerialPort,
{//Listening on the serial port for data coming from Arduino over USB
	baudRate: 57600,
	parser: serialport.parsers.readline('\n')
});

var off = function(){
   lights.off();
};

var half = numberOfLEDs/2;

var tailSize = 5,
	fade = 0.7;


var lightsOn = function(percentage, rgb){
	var i = 0;
	var ledArray = [];;
	var ledsOn = ~~((numberOfLEDs/2) * (percentage / 100));
	var ledsOff = half - ledsOn;
	

	var ts = ledsOff <= tailSize ? ledsOff  : tailSize;

	ledsOff = Math.max(ledsOff - tailSize, 0);

	for( i = 0; i < ledsOff; i++){
		ledArray.push([0,0,0]);
	}
	for( i = ts; i > 0; i--){
		//var level = ((tailSize - i) / tailSize) * fade;
		var level =((tailSize - i) / tailSize) * fade;
		ledArray.push([rgb[0] * level, rgb[1] * level, rgb[2] * level]);
	}
	for( i = 0; i < ledsOn; i++){
		ledArray.push(rgb);
	}

//	console.log(ledArray);
	var revercedLedArray = ledArray.slice(0).reverse();
	for( i = 0; i < half; i++){
		lights.set(i, ledArray[i][0],ledArray[i][1],ledArray[i][2]);
		lights.set(i + half , revercedLedArray[i][0],revercedLedArray[i][1],revercedLedArray[i][2]);
	}


	/*var start = 0; 
	var end = ~~((numberOfLEDs/2) * (percentage / 100));
	lights.fill(0, 0, 0, start, half - end);
	lights.fill(rgb[0], rgb[1], rgb[2], half - end, half);  

	lights.fill(rgb[0], rgb[1], rgb[2], half - end, end + half);
	lights.fill(0, 0, 0, end + half, numberOfLEDs);
	*/

	lights.sync();
};

var showAmplitude = function(data){
	var rgb = [255,0,0];
	if(data.rgb ){
        	var level = data.percentage / 100;
                 rgb = [Math.round(data.rgb[0] * level),
                           Math.round(data.rgb[1] * level),
                           Math.round(data.rgb[2] * level)];
        }
	lightsOn(data.percentage, rgb);
};

io.sockets.on('connection', function (socket) {
	socket.on('volume', function (data) {
		//console.log(data);
		showAmplitude(data.data);
  	});
        socket.on('beat', function (msg) {
                //console.log(data);
		var data = msg.data;
		var level = data.percentage / 100;
               	var rgb = [Math.round(data.rgb[0] * level),
			   Math.round(data.rgb[1] * level),
			   Math.round(data.rgb[2] * level)];
        	
        	try{
                        serialPort.write(new Buffer([4, rgb[0], rgb[1], rgb[2], 10]));
        	}catch(e){
                	console.log(e);
        	}
                
        });

	socket.on('disconnect', function () {
   		 off();
 	 });
});
off();
