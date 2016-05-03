var AUTOSTART = false;

var camera, scene, renderer, model;
var effect, controls;
var element, container;
var trip;
var clock = new THREE.Clock();


init();
animate();

 //Beginning of init

function init() {
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setClearColor(0x000000);
	element = renderer.domElement;
	container = document.getElementById('example');
	container.appendChild(element);

	effect = new THREE.StereoEffect(renderer);

	scene = new THREE.Scene();


	// camera = new THREE.PerspectiveCamera(90, 1, 0.001, 700);
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000);
	camera.position.set(0, 0, 0);
	camera.rotation.y = -90 * Math.PI / 180;
	scene.add(camera);

	controls = new THREE.OrbitControls(camera, element);
	controls.rotateUp(Math.PI / 4);
	controls.target.set(
		camera.position.x + 0.1,
		camera.position.y,
		camera.position.z
	);
	controls.noZoom = true;
	controls.noPan = true;

	function setOrientationControls(e) {
		if (!e.alpha) {
			return;
		}

		controls = new THREE.DeviceOrientationControls(camera, true);
		controls.connect();
		controls.update();

		element.addEventListener('click', fullscreen, false);

		window.removeEventListener('deviceorientation', setOrientationControls, true);
	}
	window.addEventListener('deviceorientation', setOrientationControls, true);

	//Control Lighting
	var ambient = new THREE.AmbientLight(0xf2f2f2);
	scene.add(ambient);

	var directionalLight = new THREE.DirectionalLight(0xffeedd);
	directionalLight.position.set(0, 0, 1).normalize();
	scene.add(directionalLight);
	
	scene.name = 'Root scene';

	window.addEventListener('resize', resize, false);
	setTimeout(resize, 1);
}



function resize() {
	var width = container.offsetWidth;
	var height = container.offsetHeight;

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	renderer.setSize(width, height);
	effect.setSize(width, height);
}

function update(dt) {
	resize();

	camera.updateProjectionMatrix();
	
	if (trip) trip.tick(dt);
	
	controls.update(dt);
}

function render(dt) {
	effect.render(scene, camera);
}

function animate(t) {
	requestAnimationFrame(animate);

	//Use this to control rotation
	if (model) {
		model.rotation.y += 0.001;
	}


	update(clock.getDelta());
	render(clock.getDelta());
}

function fullscreen() {
	if (container.requestFullscreen) {
		container.requestFullscreen();
	} else if (container.msRequestFullscreen) {
		container.msRequestFullscreen();
	} else if (container.mozRequestFullScreen) {
		container.mozRequestFullScreen();
	} else if (container.webkitRequestFullscreen) {
		container.webkitRequestFullscreen();
	}
}

function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}

function start() {
	$("#start").hide();
	$.get('trip.json', function(data) {
		trip = new Trip(scene, data);
		trip.start();
	})
	$("#background-music").get(0).play();
}

$("#start").click(start);
if (AUTOSTART) start();

