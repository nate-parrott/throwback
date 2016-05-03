function Trip(scene, data) {
	var self = this;
	self.momentsData = data.moments;
	self.scene = scene;
	self.currentMomentIndex = null;
	self.visibleMoments = {};
	self.showMomentAtIndex = function(i) {
		if (self.visibleMoments[self.currentMomentIndex]) {
			var oldIndex = self.currentMomentIndex;
			var transition = new Transition();
			if (self.momentsData[i].flight) {
				// we're going into a flight:
				transition.upwardMotion = 1;
			}
			self.visibleMoments[oldIndex].hide(transition, function() { delete self.visibleMoments[oldIndex] });
		}
		self.currentMomentIndex = i;
		var moment = new Moment(self.momentsData[i]);
		self.visibleMoments[i] = moment;
		var transition = new Transition();
		if (i > 0 && self.momentsData[i-1].flight) {
			// we're landing from a flight
			transition.upwardMotion = 1;
		}
		moment.show(self.scene, transition);
	}
	self.start = function() {
		self.showMomentAtIndex(0);
	}
	self.tick = function(dt) {
		var keys = Object.keys(self.visibleMoments);
		for (var i=0; i<keys.length; i++) {
			var momentIndex = keys[i];
			if (self.visibleMoments[momentIndex]) {
				var isDone = self.visibleMoments[momentIndex].tick(dt);
				if (isDone && momentIndex == self.currentMomentIndex) {
					self.showMomentAtIndex(self.currentMomentIndex+1);
				}
			}
		}
	}
	return self;
}
