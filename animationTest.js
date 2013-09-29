var LightStrips = require('./LPD8806').LightStrips;
var animations = require('./animations/animations');

var numberOfLEDs = 54;
var lights = new LightStrips('/dev/spidev0.0', numberOfLEDs);

lights.off()
//lights.all(0, 0, 20);
//lights.sync();
//lights.off();
var throb = new animations.Throb(lights, numberOfLEDs, [255, 0, 0], [0, 0, 255], 20);
throb.start();
//var larsonScanner = new animations.LarsonScanner(lights, numberOfLEDs, [0, 0, 255], 10, 0.75, 0, 0, 1);
//larsonScanner.start();
