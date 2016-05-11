MOMENT_APPEARANCE_TIME = 0;

function Trip(scene, data, initialLookAngle) {
	var self = this;
	self.momentsData = data.moments;
	self.scene = scene;
	self.lookAngle = initialLookAngle || 0;
	
	self.currentMomentIndex = null;
	self.currentTransition = null;
	self.preloadedMoments = {};
	self.visibleMoments = {};
	self.showMomentAtIndex = function(i) {
		var oldIndex = self.currentMomentIndex;
		/*if (self.visibleMoments[self.currentMomentIndex]) {
			var oldIndex = self.currentMomentIndex;
			self.visibleMoments[oldIndex].hide();
			delete self.visibleMoments[oldIndex]
		}*/
		self.currentMomentIndex = i;
		var moment = self.getMomentAtIndex(i);
		moment.contentGroup.rotateY(-self.lookAngle * Math.PI / 180);
		self.visibleMoments[i] = moment;
		moment.show(self.scene);
		
		// create a new transition:
		if (oldIndex !== null) {
			if (self.currentTransition) self.currentTransition.completion();
			var prevMoment = self.visibleMoments[oldIndex];
			var completion = function() {
				prevMoment.hide();
				delete self.visibleMoments[oldIndex];
			}
			self.currentTransition = new Transition(prevMoment, moment, completion, {type: 'fade', duration: 5});
			self.currentTransition.tick(0);
		}
		self.ensurePreload();
	}
	self.getMomentAtIndex = function(i) {
		var moment = self.preloadedMoments[i];
		if (moment) {
			delete self.preloadedMoments[i];
		} else {
			moment = new Moment(self.momentsData[i], i);
		}
		return moment;
	}
	self.ensurePreload = function() {
		Object.keys(self.preloadedMoments).forEach(function(i) {
			if (i != self.currentMomentIndex + 1) {
				delete self.preloadedMoments[i];
			}
		});
		if (!self.preloadedMoments[self.currentMomentIndex+1] && self.currentMomentIndex+1 < self.momentsData.length) {
			self.preloadedMoments[self.currentMomentIndex+1] = self.getMomentAtIndex(self.currentMomentIndex + 1);
		}
	}
	self.start = function() {
		MOMENT_APPEARANCE_TIME = TIME;
		self.showMomentAtIndex(0);
	}
	self.tick = function(dt) {
		if (self.currentTransition) {
			self.currentTransition.tick(dt);
			if (self.currentTransition.elapsed >= self.currentTransition.duration) {
				self.currentTransition.completion();
				self.currentTransition = null;
			}
		}
		
		var keys = Object.keys(self.visibleMoments);
		for (var i=0; i<keys.length; i++) {
			var momentIndex = keys[i];
			if (self.visibleMoments[momentIndex]) {
				var isDone = self.visibleMoments[momentIndex].tick(dt);
				if (isDone && momentIndex == self.currentMomentIndex) {
					self.showMomentAtIndex(self.currentMomentIndex+1 < self.momentsData.length ? self.currentMomentIndex+1 : 0);
				}
			}
		}
	}
	return self;
}
