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
	
	self.show = function(scene, transition) {
		self.scene = scene;
		self.scene.add(self.sky)
	}
	
	self.hide = function(transition) {
		self.scene = null;
	}
	
	return self;
}
