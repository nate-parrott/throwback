
var clampOpacity = function(x) {
	return Math.min(1, Math.max(0, x));
}

function Transition(prevMoment, nextMoment, completion, options) {
	var self = this;
	self.completion = completion;
	self.type = options.type || 'fade';
	self.duration = options.duration || 1;
	self.elapsed = 0;
	self.prevMoment = prevMoment;
	self.nextMoment = nextMoment;
	self.tick = function(dt) {
		self.elapsed += dt;
		var progress = self.elapsed / self.duration;
		var p = easeInOut(Math.min(1, progress));
		if (prevMoment) {
			if (prevMoment.sky) {
				setObjectOpacity(prevMoment.sky, 1-p);
			}
			var contentEntrance = easeIn(clampOpacity(1 - progress*2));
			setObjectOpacity(prevMoment.contentGroup, contentEntrance);
		}
		if (nextMoment) {
			var extraSpeed = 2;
			var contentEntrance = easeIn(clampOpacity((p-0.5)*2*extraSpeed));
			nextMoment.contentGroup.position.copy(new THREE.Vector3(0, -25 * (1-contentEntrance), 0));
			var scale = 1 + (1 - contentEntrance) * 2;
			nextMoment.contentGroup.scale.copy(new THREE.Vector3(scale, scale, scale));
			setObjectOpacity(nextMoment.contentGroup, contentEntrance);
		}
	}
}

