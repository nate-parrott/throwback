
function Trip(scene, data, initialLookAngle) {
	var self = this;
	self.momentsData = data.moments;
	self.scene = scene;
	self.lookAngle = initialLookAngle || 0;
	
	self.currentMomentIndex = null;
	self.currentTransition = null;
	self.preloadedMoments = {};
	self.visibleMoments = {};
	self.showMomentAtIndex = function(i) {
		var oldIndex = self.currentMomentIndex;
		self.currentMomentIndex = i;
		var moment = self.getMomentAtIndex(i);
		moment.contentCarousel.rotateY(-self.lookAngle * Math.PI / 180);
		self.visibleMoments[i] = moment;
		moment.show(self.scene);
		self.lookRay.visible = !!moment.data.rayCast;
		
		// create a new transition:
		if (oldIndex !== null) {
			if (self.currentTransition) self.currentTransition.completion();
			var prevMoment = self.visibleMoments[oldIndex];
			var completion = function() {
				prevMoment.hide();
				delete self.visibleMoments[oldIndex];
			}
			self.currentTransition = new Transition(prevMoment, moment, completion, {type: 'fade', duration: 2});
			self.currentTransition.tick(0);
		}
		self.ensurePreload();
	}
	self.getMomentAtIndex = function(i) {
		var moment = self.preloadedMoments[i];
		if (moment) {
			delete self.preloadedMoments[i];
		} else {
			moment = new Moment(self.momentsData[i], i);
		}
		return moment;
	}
	self.ensurePreload = function() {
		Object.keys(self.preloadedMoments).forEach(function(i) {
			if (i != self.currentMomentIndex + 1) {
				delete self.preloadedMoments[i];
			}
		});
		if (!self.preloadedMoments[self.currentMomentIndex+1] && self.currentMomentIndex+1 < self.momentsData.length) {
			self.preloadedMoments[self.currentMomentIndex+1] = self.getMomentAtIndex(self.currentMomentIndex + 1);
		}
	}
	self.start = function() {
		self.showMomentAtIndex(0);
	}
	self.tick = function(dt) {
		if (self.currentTransition) {
			self.currentTransition.tick(dt);
			if (self.currentTransition.elapsed >= self.currentTransition.duration) {
				self.currentTransition.completion();
				self.currentTransition = null;
			}
		}
		
		var lookPoint = new THREE.Vector3();
		lookPoint.copy(LOOK_VEC);
		lookPoint.multiplyScalar(1000);
		self.lookRay.lookAt(lookPoint);
		self.lookRay.rotateX(Math.PI/2);
		
		var currentMoment = self.visibleMoments[self.currentMomentIndex];
		if (currentMoment.data.rayCast) {
			self.raycaster.setFromCamera( new THREE.Vector2(0,0), camera );
			var hitObjects = self.raycaster.intersectObjects( currentMoment.group.children, true );
			currentMoment.rayCastHits(hitObjects);
		}
		
		var keys = Object.keys(self.visibleMoments);
		for (var i=0; i<keys.length; i++) {
			var momentIndex = keys[i];
			if (self.visibleMoments[momentIndex]) {
				var isDone = self.visibleMoments[momentIndex].tick(dt);
				if (isDone && momentIndex == self.currentMomentIndex) {
					if (self.currentMomentIndex + 1 < self.momentsData.length) {
						self.showMomentAtIndex(self.currentMomentIndex + 1);
					} else {
						location.reload();
					}
				}
			}
		}
	}
	self.raycaster = new THREE.Raycaster();
	// create the look ray:
	var lookRayLen = 200;
	var lookRayGeometry = new THREE.PlaneGeometry(0.5, lookRayLen);
	var lookRayMtl = new THREE.MeshPhongMaterial( { color: 0x88ddff, shading: THREE.FlatShading, side: THREE.DoubleSide } );
	self.lookRay = new THREE.Mesh( lookRayGeometry, lookRayMtl );
	// self.lookRay.translateZ(lookRayLen);
	self.lookRay.position.set(0,-3,0);
	self.scene.add(self.lookRay);
	
	return self;
}
