"use strict";

var tcHelper = require('./tcStatusGetter');
var config = require('./config'); 
var LightStrips = require('./LPD8806').LightStrips;
var animations = require('./animations/animations');
var everymote = require('./everymote');

var numberOfLEDs = 64;
var lights = new LightStrips('/dev/spidev0.0', numberOfLEDs);

var off = function(){
   lights.off();
};

var buildSuccess = function(){
    //rgb
    lights.all(0, 255, 0);
    lights.sync();
};

var buildFailed = function(){
    //rgb
    lights.all(255, 0, 0);
    lights.sync();
};
var building = function(percentageComplete){
    var start = 0; 
    var end = ~~(numberOfLEDs * (percentageComplete / 100));
    lights.fill(255, 0, 255, start, end);
    lights.fill(0, 0, 0, end, numberOfLEDs);
    lights.sync();
};

var handleStatus = function(data){
    //console.log(data);
    var lastbuild = JSON.parse(data).build[0];
    
    if(lastbuild.running){
       building(lastbuild.percentageComplete);
    }else if(lastbuild.status == "FAILURE"){
         buildFailed();
    }else if(lastbuild.status == "SUCCESS"){
         buildSuccess();
    }
   
};

off();
var standup = /^11:14/;
var runningAnimation;
var timer;

var interval = function(){
    var nowtime = new Date();
    
    var time = nowtime.toTimeString();
    var timeoutTime = 1000;
    if(runningAnimation){
        runningAnimation.stop();
        runningAnimation = null;
    }
    
    if(nowtime.getHours() < 8 || nowtime.getHours() >= 18){
         timeoutTime = 120000;
         off();
    }else if(standup.test(time)){
        runningAnimation = new animations.Throb(lights, numberOfLEDs, [255, 0, 0], [0, 0, 255], 5);
        runningAnimation.start();
        timeoutTime = 60000;
    }else{
      //tc.getStatus(handleStatus); 
      timeoutTime = 1000;
    }
    
    timer = setTimeout(interval, timeoutTime);  
}

interval();
var triggerAnimation = function(){
    if(runningAnimation) return;
    
    clearTimeout(timer);
    //runningAnimation = new animations.Throb(lights, numberOfLEDs, [0, 0, 255], [0, 0, 255], 1000); //new animations.LarsonScanner(lights, numberOfLEDs, [0, 0, 255], 10, 0.75, 0, 0, 1);
    runningAnimation = new animations.LarsonScanner(lights, numberOfLEDs, [0, 0, 255], 10, 0.75, 0, 0, 1);
    runningAnimation.start();
    setTimeout(interval, 60000);
};

everymote.coffeeConnecter(triggerAnimation, triggerAnimation);

process.once('SIGUSR2', function () {
  gracefulShutdown(function () {
    off();
    process.kill(process.pid, 'SIGUSR2'); 
  })
});
