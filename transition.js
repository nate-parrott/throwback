
function Transition(type, duration) {
	var self = this;
	self.type = type || 'fade';
	self.duration = duration || 0.5;
	self.tick = function(prevMoment, nextMoment, progress) {
		var p = easeInOut(progress);
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
