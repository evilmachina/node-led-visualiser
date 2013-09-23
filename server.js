var io = require('socket.io').listen(1337);
var LightStrips = require('./LPD8806').LightStrips;

var numberOfLEDs = 64;
var lights = new LightStrips('/dev/spidev0.0', numberOfLEDs);

var off = function(){
   lights.off();
};

var half = numberOfLEDs/2;

var lightsOn = function(percentage, rgb){
	var start = 0; 
	var end = ~~((numberOfLEDs/2) * (percentage / 100));


	lights.fill(0, 0, 0, start, half - end);
	lights.fill(rgb[0], rgb[1], rgb[2], half - end, half);  

	lights.fill(rgb[0], rgb[1], rgb[2], start*2, end*2);
	lights.fill(0, 0, 0, end*2, numberOfLEDs);


	lights.sync();
};

var showAmplitude = function(data){
	var rgb = [255,0,0];
	if(data.rgb){
		rgb = data.rgb;
	}
	lightsOn(data.percentage, rgb);
};

io.sockets.on('connection', function (socket) {
	socket.on('data', function (data) {
		//console.log(data);
		showAmplitude(data);
  });
});
