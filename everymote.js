var io = require('socket.io-client'),
   coffee = require('./coffee'),
   temp = require('./DS18B20');

var port = '80',
    server =  'thing.everymote.com';


var connectCoffee = function(thing, onAction){
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
		if(action.id  == "1"){ 
			onAction();			
		}

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

var connectTemp = function(thing, onAction){
    console.log(thing);
	var socket = io.connect('http://' + server + ':' + port + '/thing'
		,{"force new connection":true
            ,'reconnect': true
            ,'reconnection delay': 5000
            ,'reconnection limit': 5000
            ,'max reconnection attempts': 10 });

	socket.on('connect', function () {
		console.log('connected');
		socket.emit('setup', thing.settings);
        thing.socket = socket;
	}).on('doAction', function (action) {
		//console.log(action);
		/*if(action.id  == "1"){ 
			onAction();			
		}*/

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
	

module.exports.coffeeConnecter = function(action){
    connectCoffee(coffee.thing, action);
    connectTemp(temp.thing);
};