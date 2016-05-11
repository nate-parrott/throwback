/*

transition objects look like this:
{
	duration: 0.2,
	type: 'fade' | 'fade-out-down' | 'fade-in-up'
}

*/

MOMENT_APPEARANCE_TIME = 0;

function Moment(data, index) {
	var self = this;
	
	MOMENT_APPEARANCE_TIME = TIME;
	
	self.group = new THREE.Group();
	self.contentGroup = new THREE.Group();
	self.contentGroup.name = 'ContentGroup' + index;
	self.group.add(self.contentGroup);
	self.group.name = "Moment " + index;
	self.index = index;
	self.data = data;
	self._usedGestures = {};
	self.gestureDetector = new GestureDetector(function(gestureName) {
		if (data.gestures && data.gestures[gestureName] && !self._usedGestures[gestureName]) {
			self._usedGestures[gestureName] = true;
			self[data.gestures[gestureName]]();
		}
	})
	
	if (data.sky) {
        var material = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture(data.sky),
            side: THREE.DoubleSide,
			depthWrite: false
        });
        var sky = new THREE.Mesh(new THREE.SphereGeometry(1000, 30, 30), material);
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
		var angleDelta = -(data.contentAngleSpread || 29);
		var totalAngleDelta = angleDelta * (data.contents.length - 1);
		var offset = -totalAngleDelta/2;
		data.contents.forEach(function(item, i) {
			var angle = i * angleDelta + offset;
			var c = new Contents(item, self.contentGroup, {angle: angle, vertAngle: 0, random: false});
			self.contents.push(c);
		})
	}
	
	if (data.sceneContents) {
		data.sceneContents.forEach(function(d) {
			var c = new Contents(d, self.contentGroup, {position: new THREE.Vector3(0,0,0), translate: [0,-1,0]});
			self.contents.push(c);
		})
	}
	
	self.overlays = [];
	if (data.floatingOverlays) {
		var dist = 85 - 10;
		data.floatingOverlays.forEach(function(data) {
			dist -= 10;
			var c = new Contents(data, self.contentGroup, {angle: 0, vertAngle: 0, distance: dist, followLookVec: true})
			self.contents.push(c);
			self.overlays.push(c);
		})
	}
	
	if (data.caption) {
		self.contents.push(new Contents({type: 'text', 'textLines': data.caption}, self.contentGroup,  {angle: 0, vertAngle: -35}));
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
		self.gestureDetector.update(TIME, LOOK_VEC);
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
			var initialFlightDelay = 0.25;
			var p = Math.max(0, (self.elapsed/duration - initialFlightDelay) / (1 - initialFlightDelay));
			var progress = easeInOut(p);
			fromQ.slerp(toQ, progress);
			self.globe.quaternion.copy(fromQ);
			var altitude = 1.02 + Math.sqrt(1 - Math.pow(2*progress-1, 2)) / 4;
			self.globe.position.copy(new THREE.Vector3(0, -radius * altitude, 0));
		}
		if (data.path && data.duration) {
			var p = - (TIME - MOMENT_APPEARANCE_TIME) / data.duration;
			self.contentGroup.position.set(data.path[0] * p, data.path[1] * p, data.path[2] * p);
		}
		return self.done;
	}
	
	// gesture actions:
	self.dismissOverlaysAndFinish = function() {
		self.overlays.forEach(function(o) {
			console.log(o)
			if (o.mesh) o.mesh.parent.remove(o.mesh);
			if (o.plane) o.plane.parent.remove(o.plane)
		})
		setTimeout(function() {
			self.done = true;
		}, 2000);
	}
	
	self.rayCastHits = function(hits) {
		if (TIME - MOMENT_APPEARANCE_TIME > 1) {
			hits.forEach(function(hit) {
				var obj = hit.object;
				if (obj.isCloseButton) {
					obj.parent.parent.remove(obj.parent);
				}
			})
		}
	}
	
	return self;
}
