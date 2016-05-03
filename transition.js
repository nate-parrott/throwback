
function Transition(type, duration) {
	// all transitions are IN transitions by default
	var self = this;
	self.type = type || 'fade';
	self.duration = duration || 0.4;
	self.tick = function(moment, progress) {
		moment.group.traverse(function(node) {
			console.log(node)
			if (node.material) {
				node.material.opacity = progress;
				node.material.transparent = true;
			}
		})
	}
}
