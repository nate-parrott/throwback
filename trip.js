function Trip(scene, data) {
	var self = this;
	self.momentsData = data.moments;
	self.scene = scene;
	self.lookAngle = 0;
	
	self.currentMomentIndex = null;
	self.visibleMoments = {};
	self.showMomentAtIndex = function(i) {
		if (self.visibleMoments[self.currentMomentIndex]) {
			var oldIndex = self.currentMomentIndex;
			self.visibleMoments[oldIndex].hide();
			delete self.visibleMoments[oldIndex]
		}
		self.currentMomentIndex = i;
		var moment = new Moment(self.momentsData[i], i, self.lookAngle);
		self.visibleMoments[i] = moment;
		
		moment.show(self.scene);
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
					self.showMomentAtIndex(self.currentMomentIndex+1 < self.momentsData.length ? self.currentMomentIndex+1 : 0);
				}
			}
		}
	}
	return self;
}
