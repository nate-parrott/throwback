/*

transition objects look like this:
{
	duration: 0.2,
	type: 'fade' | 'fade-out-down' | 'fade-in-up'
}

*/

function Moment(data) {
	var self = this;
	
	self.group = new THREE.Group();
	
	if (data.sky) {
        var material = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture("france.png"),
            side: THREE.DoubleSide
        });
        var sky = new THREE.Mesh(new THREE.SphereGeometry(500, 60, 40 ), material);
        self.group.add(sky);
		self.sky = sky;
	}
	if (data.contents) {
		var angleDelta = 25;
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
	}
	
	self.hide = function(transition) {
		self.scene.remove(self.group);
		self.scene = null;
	}
	
	return self;
}
