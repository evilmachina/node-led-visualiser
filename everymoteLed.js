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

function hsv2rgb(h,s,v) {
// Adapted from http://www.easyrgb.com/math.html
// hsv values = 0 - 1, rgb values = 0 - 255
var r, g, b;
var RGB = new Array();
if(s==0){
  RGB['red']=RGB['green']=RGB['blue']=Math.round(v*255);
}else{
  // h must be < 1
  var var_h = h * 6;
  if (var_h==6) var_h = 0;
  //Or ... var_i = floor( var_h )
  var var_i = Math.floor( var_h );
  var var_1 = v*(1-s);
  var var_2 = v*(1-s*(var_h-var_i));
  var var_3 = v*(1-s*(1-(var_h-var_i)));
  if(var_i==0){ 
    var_r = v; 
    var_g = var_3; 
    var_b = var_1;
  }else if(var_i==1){ 
    var_r = var_2;
    var_g = v;
    var_b = var_1;
  }else if(var_i==2){
    var_r = var_1;
    var_g = v;
    var_b = var_3
  }else if(var_i==3){
    var_r = var_1;
    var_g = var_2;
    var_b = v;
  }else if (var_i==4){
    var_r = var_3;
    var_g = var_1;
    var_b = v;
  }else{ 
    var_r = v;
    var_g = var_1;
    var_b = var_2
  }
  //rgb results = 0 ÷ 255  
  RGB['red']=Math.round(var_r * 255);
  RGB['green']=Math.round(var_g * 255);
  RGB['blue']=Math.round(var_b * 255);
  }
return [RGB.red, RGB.green, RGB.blue];  
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
		"sat":  value.sat,
		"bri": 	value.bri
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
 


