var io = require('socket.io-client');
var port = '80',
    server =  'thing.everymote.com';

var xbeeSerialPort = '/dev/serial/by-id/usb-FTDI_FT232R_USB_UART_A800csie-if00-port0';
var serialport = require('serialport');
var serialPort = new serialport.SerialPort(xbeeSerialPort,
{//Listening on the serial port for data coming from Arduino over USB
	baudRate: 57600,
	parser: serialport.parsers.readline('\n')
});

var connectLed = function(thing, onAction){
	console.log(thing);
	var socket = io.connect('http://' + server + ':' + port + '/thing'
		,{"force new connection":true
            ,'reconnect': true
            ,'reconnection delay': 5000
            ,'reconnection limit': 5000
            ,'max reconnection attempts': 10 });

	socket.on('connect', function () {
		console.log('connected');
		socket.emit('setup', thing);
	}).on('doAction', function (action) {
		//console.log(action);
		onAction(action, socket);

	}).on('connect_failed', function () {
		console.log('error:' + socket );
	}).on('disconnect', function () {
		console.log('disconnected');
	}).on('reconnect', function () {
		console.log('reconnect');
	}).on('reconnecting', function () {
		console.log('reconnecting');
	}).on('reconnect_failed', function () {
		console.log('reconnect_failed');
	});
};

var createLed = function(light, lightSettings){
	
	return { 
		"name": "Led Stripe",
		"id": 4,
		"iconType": "Lamp",
		//"info":"Press link button on hub and pair"
		"actionControles": [
                {"type":"button", "name":"On", "id":"on"},
                {"type":"button", "name":"Off", "id":"off"},
                {"type":"hsl", "name":"color picker", "id":"color",
                	 "curentState":												
                	 				{"hue":0,"bri":1,"sat":0}}
            ]
	};	
};

var sendCollor = function(rgb){
	serialPort.write(new Buffer([4, rgb[0], rgb[1], rgb[2], 10]));
};

var on = function(){
	sendCollor([255,255,255]);
};

var off = function(){
	sendCollor([0,0,0]);
};

function hsv2rgb(h, s, v) {
	var r, g, b;
	var i;
	var f, p, q, t;
	
	// Make sure our arguments stay in-range
	h = Math.max(0, Math.min(360, h));
	s = Math.max(0, Math.min(100, s));
	v = Math.max(0, Math.min(100, v));
	
	// We accept saturation and value arguments from 0 to 100 because that's
	// how Photoshop represents those values. Internally, however, the
	// saturation and value are calculated from a range of 0 to 1. We make
	// That conversion here.
	s /= 100;
	v /= 100;
	
	if(s == 0) {
		// Achromatic (grey)
		r = g = b = v;
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}
	
	h /= 60; // sector 0 to 5
	i = Math.floor(h);
	f = h - i; // factorial part of h
	p = v * (1 - s);
	q = v * (1 - s * f);
	t = v * (1 - s * (1 - f));

	switch(i) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;
			
		case 1:
			r = q;
			g = v;
			b = p;
			break;
			
		case 2:
			r = p;
			g = v;
			b = t;
			break;
			
		case 3:
			r = p;
			g = q;
			b = v;
			break;
			
		case 4:
			r = t;
			g = p;
			b = v;
			break;
			
		default: // case 5:
			r = v;
			g = p;
			b = q;
	}
	
	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

var createActonHandler = function(){
	var actions = {};
	actions.on = function(value){
		on();
	};
	actions.off = function(value){
		off();
	};
	actions.color = function(value, socket){
		processAcction = true;
		//hueApi.setLightState(light.id, offState).done();
		socket.emit('updateActionControlerState', {"id":"color", 
			"curentState":{"hue":value.hue,"bri":value.bri,"sat":value.sat}});
	var data = {
		"hue":  Math.round(value.hue * 360),
		"sat":  Math.round(value.sat * 100),
		"bri": 	Math.round(value.bri * 100);
		};
		console.log("value");
		console.log(value);
		console.log("data");
		console.log(data);

		var rgb = hsv2rgb(data.hue, data.sat, data.bri);
		console.log(rgb);
		sendCollor(rgb);
	};

	var actionHandler = function(action, socket){
		actions[action.id](action.value, socket);
	};

	return actionHandler;
};

	
connectLed(createLed(), createActonHandler());
 


