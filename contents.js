var Contents = function(data, angle, node) {
	var self = this;
	if (data.type === 'image') {
		addImageContents(self, node, data.url, angle, 0);
	}
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
		 	var geometry = new THREE.PlaneGeometry( 20 * geoWidth, 20 * geoHeight);
		 	// var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
		 	var plane = new THREE.Mesh( geometry, material );
		 	plane.rotateY((angle + 180) * Math.PI / 180 + Math.PI/2);
			plane.rotateX(vertAngle * Math.PI / 180);
			// plane.rotateZ((Math.random() - 0.5) * 2 * Math.PI * 2 * 0.1)
		 	plane.translateZ(-70);
		 	node.add( plane );
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
