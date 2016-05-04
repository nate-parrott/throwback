
function Transition(prevMoment, nextMoment, completion, options) {
	var self = this;
	self.completion = completion;
	self.type = options.type || 'fade';
	self.duration = options.duration || 0.5;
	self.elapsed = 0;
	self.prevMoment = prevMoment;
	self.nextMoment = nextMoment;
	self.tick = function(dt) {
		self.elapsed += dt;
		var p = easeInOut(Math.min(1, self.elapsed / self.duration));
		if (prevMoment) {
			if (prevMoment.sky) {
				setObjectOpacity(prevMoment.sky, 1-p);
			}
			setObjectOpacity(prevMoment.contentGroup, 1-p);
		}
		if (nextMoment) {
			setObjectOpacity(nextMoment.contentGroup, p);
		}
	}
}
