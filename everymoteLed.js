var io = require('socket.io-client'),
   coffee = require('./coffee'),
   temp = require('./DS18B20');

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
	var color = getHSLColor(lightSettings.state);
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
                	 				{"hue":0,"bri":0,"sat":0}}
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

function hsvToRgb(h, s, v){
      //h *= 360;
        var r, g, b, X, C;
        h = (h % 360) / 60;
        C = v * s;
        X = C * (1 - Math.abs(h % 2 - 1));
        R = G = B = v - C;

        h = ~~h;
        r = [C, X, 0, 0, X, C][h];
        g = [X, C, C, X, 0, 0][h];
        b = [0, 0, X, C, C, X][h];
    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
};

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
		"hue":  Math.round(value.hue * 65535),
		"sat":  Math.round(value.sat * 255),
		"bri": 	Math.round(value.bri * 255)
		};
		
		console.log(value);
		console.log(data);

		var rgb = hsvToRgb(data.hue, data.sat, data.bri);
		sendCollor(rgb);
	};

	var actionHandler = function(action, socket){
		actions[action.id](action.value, socket);
	};

	return actionHandler;
};

	
connectLed(createLed(), createActonHandler());
 


