/*

transition objects look like this:
{
	duration: 0.2,
	type: 'fade' | 'fade-out-down' | 'fade-in-up'
}

*/

var _momentIdx = 0;

function Moment(data) {
	var self = this;
	
	self.group = new THREE.Group();
	self.group.name = "Moment " + _momentIdx++;
	
	if (data.sky) {
        var material = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture(data.sky),
            side: THREE.DoubleSide
        });
        var sky = new THREE.Mesh(new THREE.SphereGeometry(500, 60, 40 ), material);
		sky.renderOrder = -1;
        self.group.add(sky);
		self.sky = sky;
	}
	if (data.contents) {
		var angleDelta = 45;
		var totalAngleDelta = angleDelta * data.contents.length;
		var offset = -totalAngleDelta/2;
		data.contents.forEach(function(item, i) {
			var angle = (data.contents.length - i) * angleDelta + offset;
			var c = new Contents(item, angle, self.group);
		})
	}
	
	self.show = function(scene, transition) {
		self.scene = scene;
		self.scene.add(self.group)
		self.elapsed = 0;
		self.done = false;
		self.inTransition = transition;
	}
	
	self.hide = function(transition, finishedCallback) {
		var done = function() {
			self.scene.remove(self.group);
			self.scene = null;
			finishedCallback();
		}
		if (transition) {
			self.outTransition = transition;
			self.onOutTransitionDone = done;
			self.hiddenAtTime = self.elapsed;
		} else {
			done();
		}
	}
	
	self.elapsed = 0;
	self.tick = function(dt) {
		// return true if we're done here
		self.elapsed += dt;
		if (data.duration && self.elapsed >= data.duration && !self.done) {
			self.done = true;
		}
		if (self.inTransition) {
			var progress = Math.min(1, self.elapsed / self.inTransition.duration);
			self.inTransition.tick(self, progress);
			if (progress == 1) {
				delete self.inTransition;
			}
		}
		if (self.outTransition) {
			var transitionProgress = Math.min(1, (self.elapsed - self.hiddenAtTime) / self.outTransition.duration);
			self.outTransition.tick(self, 1-transitionProgress);
			if (transitionProgress == 1) {
				self.onOutTransitionDone();
			}
		}
		return self.done;
	}
	
	return self;
}
