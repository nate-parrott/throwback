
function HeadShakeGestureCandidate() {
	var self = this;
	self.name = "headShake";
	self.startTime = null;
	self.lastLook = null;
	self.success = false;
	self.failure = false;
	self.hits = 0;
	self.lastDirection = 0;
	self.update = function(time, look_) {
		var look = new THREE.Vector3(look_.x, 0, look_.z);
		if (self.startTime === null) {
			self.startTime = time;
			self.lastLook = look;
		}
		var angle = self.lastLook.angleTo(look);
		if (angle != 0) {
			var minDegreeChange = 15;
			var cross = new THREE.Vector3();
			cross.crossVectors(look, self.lastLook);
			var direction = 0;
			if (cross.y > 0) direction = 1;
			else if (cross.y < 0) direction = -1;
			
			if (angle > minDegreeChange / 180 * Math.PI && direction != self.lastDirection) {
				self.lastLook = look;
				self.lastDirection = direction;
				self.startTime = time;
				self.hits++;
				self.success = self.hits >= 5;
			}
		}
		self.failure = time - self.startTime > 1;
	}
	return self;
}

function GestureDetector(callback) {
	var self = this;
	self.candidates = [];
	self.lastTimeStep = 0;
	self.update = function(time, look) {	
		var timeStep = Math.floor(time * 4);
		if (timeStep != self.lastTimeStep) {
			self.candidates.push(new HeadShakeGestureCandidate());
			self.lastTimeStep = timeStep;
		}
		self.candidates.forEach(function(c) {
			c.update(time, look);
			if (c.success) {
				callback(c.name);
			}
		})
		self.candidates = self.candidates.filter(function(c) {
			return !c.failure && !c.success;
		})
	}
	return self;
}
