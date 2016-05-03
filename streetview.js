var loader = new GSVPANO.PanoLoader({
       zoom: 2
     });
     // Set loading sign.
     // Implement the onPanoramaLoad handler
 loader.on('panorama.load', function(pano) {
   var canvas = pano.canvas;
 	// document.body.appendChild(canvas);
 	var dataUrl = canvas.toDataURL();
    var img = document.createElement('img');
 	img.src = dataUrl;
	document.body.appendChild(img)
 });
 loader.on('panorama.data', function(pano) {
	 console.log('DATA')
 });
 // Invoke the load method with a LatLng point.
 var lat = 48.8589137;
 var lng = 2.2933281;
 loader.load(new google.maps.LatLng(lat, lng));
 // Set error handle.
 loader.on('panorama.progress', function(p, pano) {
	 
 });
 // Set error handle.
 loader.on('error', function(message) {
   alert(message);
 });

