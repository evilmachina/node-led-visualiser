function LarsonScanner(setter, num_pixels, color, tail, fade, start, end, speed)
{
    this.speed = speed;
    this.setter = setter; 
    this.fade = fade;
    this.larsonStep = 0;
    this.larsonDir = -1;
    this.larsonLast = 0;
    this.color = color;
    if (end === 0 || end > num_pixels){
        end = num_pixels;
    }
    
	this.startPos = start;
    this.end = end;
    this.size = end - start + 1;
    
    tail += 1; //makes tail math later easier
    if(tail >= this.size / 2){
			tail = (this.size / 2) - 1;
    }
    
    this.tail = tail;  
}

LarsonScanner.prototype.start = function() {
    this.running = true;
    this.tick();
};


LarsonScanner.prototype.stop = function() {
    this.running = false;
};

LarsonScanner.prototype.tick = function() {
    var self = this;
    self.larsonLast = self.startPos + self.larsonStep;
    self.setter.clear();
    self.setter.set(self.larsonLast, self.color[0], self.color[1], self.color[2]);
    
    var tl = self.tail;
    var tr = self.tail;
    
    if(self.larsonLast + tl > self.end)
		tl = self.end - self.larsonLast;
    
	if(self.larsonLast - tr < self.startPos)
        tr = self.larsonLast - self.startPos;

    for(var l = 1; l <= tl; l++ ){
        var level = ((self.tail - l) / self.tail) * self.fade;
		self.setter.set(self.larsonLast + l, self.color[0] * level, self.color[1] * level, self.color[2] * level);
	}
   
   for(var r = 1; r <= tr; r++ ){
        var level = ((self.tail - r) / self.tail) * self.fade;
		self.setter.set(self.larsonLast - r, self.color[0] * level, self.color[1] * level, self.color[2] * level);
	}    

   	if ((this.startPos + this.larsonStep) >= self.end){
			this.larsonDir = -this.larsonDir       
	}else if(this.larsonStep <= 0){
			this.larsonDir = -this.larsonDir
    }
    
	this.larsonStep += this.larsonDir
    this.setter.sync();
    
    if (self.running) {
        setTimeout(function() { self.tick(); }, this.speed);
    }
};

module.exports = LarsonScanner;
