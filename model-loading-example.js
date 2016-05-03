//models
	
	var onProgress = function ( xhr ) {
				if ( xhr.lengthComputable ) {
					var percentComplete = xhr.loaded / xhr.total * 100;
					console.log( Math.round(percentComplete, 2) + '% downloaded' );
				}
			};

			var onError = function ( xhr ) {
			};

//Beginnning of model loader. Remember to change 3jsTemplate to your folder name!

THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

	var loader = new THREE.OBJMTLLoader();
		loader.load( 'model/mesh.obj', 'model/mesh.mtl', function ( object ) {
			model = object;
			//Use these to set the object's position
			//object.position.y = 0;
			//object.position.x = 0;
			//object.position.z = 0;
			
			//Use these to change the object's scale
			//object.scale.y = 1;
			//object.scale.x = 1;
			//object.scale.z = 1;
			
			scene.add( model );

		}, onProgress, onError );

//End of model loader