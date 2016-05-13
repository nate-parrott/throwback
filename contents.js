var Contents = function(data, node, positionInfo) {
	var self = this;
	self.positionInfo = positionInfo;
	if (data.scale) positionInfo.scale = data.scale;
	if (data.translate) positionInfo.translate = data.translate;
	if (data.nod) positionInfo.nod = data.nod;
	if (data.appearanceDelay) positionInfo.appearanceDelay = data.appearanceDelay;
	if (data.random) positionInfo.random = data.random;
	if (data.wobble) positionInfo.wobble = data.wobble;
	if (data.steadilyAdvancing) positionInfo.steadilyAdvancing = data.steadilyAdvancing;
	if (data.blink) positionInfo.blink = data.blink;
	
	if (data.type === 'image') {
		addImageContents(self, node, data, function(node){
			positionContentObject(node, positionInfo);
		});
	} else if (data.type === 'text') {
		addTextContents(self, node, data, function(node) {
			positionContentObject(node, positionInfo);
		});
	} else if (data.type === 'video') {
		addVideoContents(self, node, data, function(node) {
			positionContentObject(node, positionInfo);
		});
	} else if (data.type === 'obj') {
		addObjContents(self, node, data, function(node) {
			positionContentObject(node, positionInfo);
		});
	} else if (data.type === 'randomSquare') {
		addRandomSquare(self, node, data, function(node) {
			positionContentObject(node, positionInfo);
		})
	}
	self.tick = function(dt) {
		if (self.animator) self.animator.update(1000 * dt);
		
		var shouldReposition = false
		if (positionInfo.followLookVec) {
			var look = LOOK_VEC;
			positionInfo.angle = -Math.atan2(look.z, look.x) / Math.PI * 180;
			shouldReposition = true
		}
		if (positionInfo.nod || positionInfo.appearanceDelay || positionInfo.wobble || positionInfo.steadilyAdvancing || positionInfo.blink) {
			shouldReposition = true
		}
		if (shouldReposition) {
			if (self.plane) {
				positionContentObject(self.plane, positionInfo);
			} else if (self.mesh) {
				positionContentObject(self.mesh, positionInfo);
			} else if (self.group) {
				positionContentObject(self.group, positionInfo);
			}
		}
	}
	return self;
}

function positionContentObject(obj, positionInfo) {
	var angle = positionInfo.angle || 0;
	var vertAngle = positionInfo.vertAngle || 0;
	var spinRotation = 0;
	var random = positionInfo.random || false;
	var distance = positionInfo.distance || 85;
	var scale = positionInfo.scale || 1;
	
	if (positionInfo.appearanceDelay) {
		var time = (TIME - MOMENT_APPEARANCE_TIME - positionInfo.appearanceDelay) / 0.5;
		time = Math.min(1, Math.max(0, time));
		scale *= easeInOut(time);
	}
	if (scale == 0) scale = 0.001;
	
	if (random) {
		if (!positionInfo._rand) {
			positionInfo._rand = {v: (Math.random() * 2 - 1) * 20, a: (Math.random() * 2 - 1) * 20, s: (Math.random() * 2 - 1) * 0.2};
		}
		vertAngle += positionInfo._rand.v;
		angle += positionInfo._rand.a;
		scale += positionInfo._rand.s;
	}
	
	if (positionInfo.wobble) {
		spinRotation = Math.sin(TIME * positionInfo.wobble) * 20;
	}
	
	if (positionInfo.steadilyAdvancing) {
		distance -= (TIME - MOMENT_APPEARANCE_TIME) * 4;
	}
	
	var objPos = positionInfo.position;
	if (!objPos) {
		objPos = new THREE.Vector3(distance,0,0);
		objPos.applyAxisAngle(new THREE.Vector3(0,0,1), vertAngle * Math.PI / 180);
		objPos.applyAxisAngle(new THREE.Vector3(0,1,0), angle * Math.PI / 180);
	}
	
	if (positionInfo.isFlyingComment) {
		var dist = 55;
		if (!positionInfo._timeOffset) positionInfo._timeOffset = Math.random();
		var y = (Math.fmod(TIME / 2 + positionInfo._timeOffset, 1) * 2 - 1) * dist;
		var alpha = 2 * (1 - Math.abs(y - dist));
		// setObjectOpacity(obj, alpha);
		objPos.y += y;
		if (!positionInfo._commentOffset) {
			positionInfo._commentOffset = {x: (Math.random() * 2 - 1) * 50, z: (Math.random() * 2 - 1) * 50};
		}
		objPos.z += positionInfo._commentOffset.z;
		objPos.x += positionInfo._commentOffset.x;
	}
	
	obj.matrix.identity();	
	obj.position.copy(objPos);
	
	if (positionInfo.blink) {
		obj.visible = Math.cos(TIME * positionInfo.blink) > 0;
	}
	
	obj.lookAt(new THREE.Vector3(0,0,0));
	
	if (positionInfo.nod) {
		var t = Math.sin(TIME * positionInfo.nod);
		obj.rotateY(t * Math.PI * 2 * 0.1);
	}
	if (spinRotation) obj.rotateZ(spinRotation / 180 * Math.PI);
	obj.scale.set(scale,scale,scale);
	
	if (positionInfo.translate) {
		obj.translateX(positionInfo.translate[0])
		obj.translateY(positionInfo.translate[1]);
		obj.translateZ(positionInfo.translate[2]);
	}
}

function addVideoContents(self, node, data, callback) {
	var framerate = data.framerate;
	var rows = data.rows;
	var columns = data.columns;
	var url = data.url;
	var count = data.count;
	
	var loader = new THREE.TextureLoader();

	// load a resource
	loader.load(url, function(texture) {
		
		var geoWidth = 1;
		var geoHeight = 1;
		var aspect = (texture.image.width / columns) / (texture.image.height / rows);
		if (aspect > 1) {
			geoHeight /= aspect;
		} else {
			geoWidth *= aspect;
		}
		// do something with the texture
		var material = new THREE.MeshBasicMaterial( {
			map: texture,
			side: THREE.DoubleSide
		 } );
		var size = 50;
		self.animator = new TextureAnimator( texture, columns, rows, count, 1000/framerate ); // texture, #horiz, #vert, #total, duration.
		var runnerMaterial = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } );
		var runnerGeometry = new THREE.PlaneGeometry(size * geoWidth, size * geoHeight, 1, 1);
		var runner = new THREE.Mesh(runnerGeometry, runnerMaterial);
		node.add(runner);
		callback(runner);
	});
}

function addImageContents(self, node, data, callback) {
	var url = data.url;
	var loader = new THREE.TextureLoader();
	// load a resource
	loader.load(
		// resource URL
		url,
		// Function when resource is loaded
		function ( texture ) {
			var geoWidth = 1;
			var geoHeight = 1;
			var aspect = texture.image.width / texture.image.height;
			if (aspect > 1) {
				geoHeight /= aspect;
			} else {
				geoWidth *= aspect;
			}
			// do something with the texture
			var material = new THREE.MeshBasicMaterial( {
				map: texture,
				side: THREE.DoubleSide
			 } );
			var size = 50;
		 	var geometry = new THREE.PlaneGeometry( size * geoWidth, size * geoHeight);
		 	// var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
		 	var plane = new THREE.Mesh( geometry, material );
		 	node.add( plane );
			// console.log("adding image ", url, " to ", node);
			self.plane = plane;
			if (data.closeButton) {
				createCloseButton(plane, size * geoWidth, size * geoHeight);
			}
			callback(plane);
		},
		// Function called when download progresses
		function ( xhr ) {
			
		},
		// Function called when download errors
		function ( xhr ) {
			console.log('error loading ', url);
		}
	);
}

function addRandomSquare(self, node, data, callback) {
	var size = 100;
 	var geometry = new THREE.PlaneGeometry( size, size);
 	var material = new THREE.MeshBasicMaterial( {color: Math.random() * 0xffffff, side: THREE.DoubleSide} );
 	var plane = new THREE.Mesh( geometry, material );
 	node.add( plane );
	// console.log("adding image ", url, " to ", node);
	self.plane = plane;
	callback(plane);
}

function addObjContents(self, node, data, callback) {
	loadObj(data.url, data.name, function(mesh) {
		node.add(mesh);
		self.mesh = mesh;
		callback(mesh);
	})
}


function addTextContents(self, node, data, callback) {
	var textLines = data.textLines;
	var loader = new THREE.FontLoader();
	getFont(function ( font ) {
		/*var material = new THREE.MultiMaterial( [
							new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } ), // front
							new THREE.MeshPhongMaterial( { color: 0xcccccc, shading: THREE.SmoothShading } ) // side
						] );*/
		var material = new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } ); // front
		var size = 4.5;
		var totalHeight = size * 1.5 * textLines.length;
		var group = new THREE.Group();
		self.group = group;
		textLines.forEach(function(text, i) {
			var textGeo = new THREE.TextGeometry(text, {
								font: font,
								size: size,
								height: 0.01,
								material: 0,
								curveSegments: 2
							});
			textGeo.computeBoundingBox();
			var width = textGeo.boundingBox.max.x - textGeo.boundingBox.min.x;
			var height = textGeo.boundingBox.max.y - textGeo.boundingBox.min.y;
			// var material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
			var mesh = new THREE.Mesh(textGeo, material);
			group.add(mesh);
			mesh.translateY(-(size * 1.5 * i - totalHeight/2));
			mesh.translateX(-width/2);
		});
		node.add(group)
		callback(group)
	} );
}

var _font;
function getFont(callback) {
	if (_font) {
		callback(_font);
	} else {
		var loader = new THREE.FontLoader();
		loader.load('fonts/helvetiker_regular.typeface.js', function ( font ) {
			_font = font;
			callback(font);
		})
	}
}

function loadObj(url, name, callback) {
	var mtlLoader = new THREE.MTLLoader();
	mtlLoader.setBaseUrl(url + '/');
	mtlLoader.setPath(url + '/');
	mtlLoader.load( name + '.mtl', function( materials ) {
		materials.preload();
		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials( materials );
		objLoader.setPath(url + '/');
		objLoader.load( name + '.obj', function ( object ) {
			object.traverse( function( node ) {
			    if( node.material ) {
			        node.material.side = THREE.DoubleSide;
			    }
			});
			callback(object)
		}, function(progress) {}, function(e) {console.error(e)} );
	});
}

function createCloseButton(parentNode, parentNodeWidth, parentNodeHeight) {
	var loader = new THREE.TextureLoader();
	// load a resource
	loader.load(
		// resource URL
		"static/x.png",
		// Function when resource is loaded
		function ( texture ) {
			// do something with the texture
			var material = new THREE.MeshBasicMaterial( {
				map: texture,
				side: THREE.DoubleSide
			 } );
			var size = 10;
		 	var geometry = new THREE.PlaneGeometry(size, size);
		 	// var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
		 	var plane = new THREE.Mesh( geometry, material );
		 	parentNode.add(plane);
			plane.isCloseButton = true;
			plane.position.set(-parentNodeWidth/2 + size/2, -(-parentNodeHeight/2 + size/2), 0.1);
		},
		// Function called when download progresses
		function ( xhr ) {
			
		},
		// Function called when download errors
		function ( xhr ) {
			console.log('error loading ', url);
		}
	);
}

