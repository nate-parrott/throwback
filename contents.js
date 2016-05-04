var Contents = function(data, angle, node) {
	var self = this;
	if (data.type === 'image') {
		addImageContents(self, node, data.url, angle, 0);
	} else if (data.type === 'text') {
		addTextContents(self, node, data.textLines, angle, 0);
	} else if (data.type === 'video') {
		addVideoContents(self, node, data.url, data.columns, data.rows, data.count, data.framerate, angle, 0);
	}
	self.tick = function(dt) {
		if (self.animator) self.animator.update(1000 * dt);
	}
	return self;
}

function positionContentObject(obj, angle, vertAngle, random) {
 	obj.rotateY((angle + 180) * Math.PI / 180 + Math.PI/2);
	obj.rotateX(vertAngle * Math.PI / 180);
	if (random) obj.rotateZ((Math.random() - 0.5) * 2 * Math.PI * 2 * 0.03)
 	obj.translateZ(-70);
}

function addVideoContents(self, node, url, columns, rows, count, framerate, angle, vertAngle) {
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
		positionContentObject(runner, angle, vertAngle, true);
	});
}

function addImageContents(self, node, url, angle, vertAngle) {
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
			positionContentObject(plane, angle, vertAngle, true);
		 	node.add( plane );
			// console.log("adding image ", url, " to ", node);
			self.plane = plane;
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


function addTextContents(self, node, textLines, angle, vertAngle) {
	var loader = new THREE.FontLoader();
	getFont(function ( font ) {
		/*var material = new THREE.MultiMaterial( [
							new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } ), // front
							new THREE.MeshPhongMaterial( { color: 0xcccccc, shading: THREE.SmoothShading } ) // side
						] );*/
		var material = new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } ); // front
		var size = 3;
		var totalHeight = size * 1.5 * textLines.length;
		textLines.forEach(function(text, i) {
			var textGeo = new THREE.TextGeometry(text, {
								font: font,
								size: 3.5,
								height: 0.2,
								material: 0
							});
			textGeo.computeBoundingBox();
			var width = textGeo.boundingBox.max.x - textGeo.boundingBox.min.x;
			var height = textGeo.boundingBox.max.y - textGeo.boundingBox.min.y;
			// var material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
			var mesh = new THREE.Mesh(textGeo, material);
			positionContentObject(mesh, angle, vertAngle, false);
			mesh.translateY(-(size * 1.5 * i - totalHeight/2));
			node.add(mesh);
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
