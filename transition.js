
function Transition(type, duration) {
	// all transitions are IN transitions by default
	var self = this;
	self.type = type || 'fade';
	self.duration = duration || 0.5;
	self.upwardMotion = 0; // max. 1
	self.forwardMotion = 0;
	self.tick = function(moment, progress) {
		moment.group.position.set(0, -self.upwardMotion * (1 - progress) * 50, -self.forwardMotion * (1 - progress) * 50);
		moment.group.traverse(function(node) {
			if (node.material) {
				node.material.opacity = progress;
				node.material.transparent = true;
			}
		})
	}
}
