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
	}
	
	self.hide = function(transition, finishedCallback) {
		self.scene.remove(self.group);
		self.scene = null;
		finishedCallback();
	}
	
	self.tick = function(dt) {
		// return true if we're done here
		self.elapsed += dt;
		if (data.duration && self.elapsed >= data.duration && !self.done) {
			self.done = true;
		}
		return self.done;
	}
	
	return self;
}
