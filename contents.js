var Contents = function(data, node, positionInfo) {
	var self = this;
	if (data.scale) positionInfo.scale = data.scale;
	if (data.translate) positionInfo.translate = data.translate;
	if (data.nod) positionInfo.nod = data.nod;
	
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
	}
	self.tick = function(dt) {
		if (self.animator) self.animator.update(1000 * dt);
		
		if (positionInfo.followLookVec) {
			var look = LOOK_VEC;
			positionInfo.angle = -Math.atan2(look.z, look.x) / Math.PI * 180;
			if (self.plane) {
				positionContentObject(self.plane, positionInfo);
			} else if (self.mesh) {
				positionContentObject(self.mesh, positionInfo);
			}
		}
		if (positionInfo.nod) {
			if (self.mesh) {
				positionContentObject(self.mesh, positionInfo);
			}
		}
	}
	return self;
}

function positionContentObject(obj, positionInfo) {
	var angle = positionInfo.angle || 0;
	var vertAngle = positionInfo.vertAngle || 0;
	var random = positionInfo.random || false;
	var distance = positionInfo.distance || 85;
	var scale = positionInfo.scale || 1;
	
	var objPos = new THREE.Vector3(distance,0,0);
	objPos.applyAxisAngle(new THREE.Vector3(0,0,1), vertAngle * Math.PI / 180);
	objPos.applyAxisAngle(new THREE.Vector3(0,1,0), angle * Math.PI / 180);

	obj.matrix.identity();	
	obj.position.copy(objPos);
	obj.lookAt(new THREE.Vector3(0,0,0));
	if (positionInfo.nod) {
		var t = Math.sin(TIME * positionInfo.nod);
		obj.rotateY(t * Math.PI * 2 * 0.1);
	}
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
		textLines.forEach(function(text, i) {
			var textGeo = new THREE.TextGeometry(text, {
								font: font,
								size: size,
								height: 0.01,
								material: 0
							});
			textGeo.computeBoundingBox();
			var width = textGeo.boundingBox.max.x - textGeo.boundingBox.min.x;
			var height = textGeo.boundingBox.max.y - textGeo.boundingBox.min.y;
			// var material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
			var mesh = new THREE.Mesh(textGeo, material);
			node.add(mesh);
			callback(mesh);
			mesh.translateY(-(size * 1.5 * i - totalHeight/2));
			mesh.translateX(-width/2);
		});
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

