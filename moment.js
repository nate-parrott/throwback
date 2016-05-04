/*

transition objects look like this:
{
	duration: 0.2,
	type: 'fade' | 'fade-out-down' | 'fade-in-up'
}

*/

var _momentIdx = 0;

function Moment(data, index) {
	var self = this;
	
	self.group = new THREE.Group();
	self.contentGroup = new THREE.Group();
	self.group.add(self.contentGroup);
	self.group.name = "Moment " + _momentIdx++;
	self.index = index;
	
	if (data.sky) {
        var material = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture(data.sky),
            side: THREE.DoubleSide,
			depthWrite: false
        });
        var sky = new THREE.Mesh(new THREE.SphereGeometry(500, 30, 30), material);
		sky.renderOrder = -1000 - index;
        self.group.add(sky);
		self.sky = sky;
	}
	
	if (data.flight) {
		var radius = 200;
		var segments = 70;
		var globe = new THREE.Mesh(
				new THREE.SphereGeometry(radius, segments, segments),
				new THREE.MeshPhongMaterial({
					map:         THREE.ImageUtils.loadTexture('assets/2_no_clouds_4k.jpg')
					// bumpMap:     THREE.ImageUtils.loadTexture('assets/elev_bump_4k.jpg'),
					// bumpScale:   0.005,
					// specularMap: THREE.ImageUtils.loadTexture('assets/water_4k.png'),
					// specular:    new THREE.Color('grey')								
				})
		);
		globe.renderOrder = 2;
		self.contentGroup.add(globe);
		self.globe = globe;
	}
	
	self.contents = [];
	if (data.contents) {
		var angleDelta = -49;
		var totalAngleDelta = angleDelta * (data.contents.length - 1);
		var offset = -totalAngleDelta/2;
		data.contents.forEach(function(item, i) {
			var angle = i * angleDelta + offset;
			var c = new Contents(item, angle, self.contentGroup);
			self.contents.push(c);
		})
	}
	
	self.show = function(scene) {
		self.scene = scene;
		self.scene.add(self.group)
		self.elapsed = 0;
		self.done = false;
	}
	
	self.hide = function() {
		self.scene.remove(self.group);
		self.scene = null;
	}
	
	self.elapsed = 0;
	self.tick = function(dt) {
		// return true if we're done here
		self.elapsed += dt;
		self.contents.forEach(function(item) {
			item.tick(dt);
		})
		if (data.duration && self.elapsed >= data.duration && !self.done) {
			self.done = true;
		}
		if (data.flight) {
			var fromQ = quaternionFromLatLng(data.flight.from[0], data.flight.from[1]);
			var toQ = quaternionFromLatLng(data.flight.to[0], data.flight.to[1]);
			var duration = data.duration;
			if (data.endMidFlight) duration *= 1.1;
			var progress = easeInOut(Math.min(1, self.elapsed / duration));
			fromQ.slerp(toQ, progress);
			self.globe.quaternion.copy(fromQ);
			var altitude = 1.02 + Math.sqrt(1 - Math.pow(2*progress-1, 2)) / 4;
			self.globe.position.copy(new THREE.Vector3(0, -radius * altitude, 0));
		}
		return self.done;
	}
	
	return self;
}
