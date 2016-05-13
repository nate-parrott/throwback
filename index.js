var AUTOSTART = false;

var LOOK_VEC = new THREE.Vector3(0,0,-1);
var TIME = 0;

Math.fmod = function (a,b) { return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); };

var camera, scene, renderer, model;
var effect, controls;
var element, container;
var trip;
var clock = new THREE.Clock();

function isMobile() {
	var nav = navigator.userAgent;
	var mobile = false;
	['Android', 'Mobile'].forEach(function(word) {
		if (nav.indexOf(word) != -1) {
			mobile = true;
		}
	})
	return mobile;
}

 // Beginning of init

function init(cardboard) {
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setClearColor(0x000000);
	if (location.hash != '#noretina') {
		renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
	}
	element = renderer.domElement;
	container = document.getElementById('example');
	container.appendChild(element);
	
	if (cardboard) {
		effect = new THREE.StereoEffect(renderer);
	}
	
	scene = new THREE.Scene();

	// camera = new THREE.PerspectiveCamera(90, 1, 0.001, 700);
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000);
	camera.position.set(0, 0, 0);
	camera.rotation.y = -90 * Math.PI / 180;
	scene.add(camera);
	
	controls = new THREE.OrbitControls(camera, element);
	controls.rotateUp(0);
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

	// Control Lighting
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
	if (effect) {
		effect.setSize(width, height);
	}
}

_lookAngle = 0;
function update(dt) {
	TIME += dt;
	
	resize();

	camera.updateProjectionMatrix();
	
	var lookVec = new THREE.Vector3();
	camera.getWorldDirection(lookVec);
	LOOK_VEC = lookVec;
	_lookAngle = Math.atan2(lookVec.z, lookVec.x) * 180 / Math.PI;
	// default look vector: (1,0,0)
	if (trip) {
		trip.lookAngle = _lookAngle;
		trip.tick(dt);
	}
	
	controls.update(dt);
}

function render(dt) {
	if (effect) {
		effect.render(scene, camera);
	} else {
		renderer.render(scene, camera);
	}
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

function start(cardboard) {
	init(cardboard);
	animate();
	$("#splash").hide();
	$.get('trip.json', function(data) {
		setTimeout(function() {
			trip = new Trip(scene, data, _lookAngle);
			trip.start();
		}, 500);
	})
	$("#background-music").get(0).play();
}

$("#start-cardboard").click(function() {
	start(true);
});
$("#start-normal").click(function() {
	start(false);
})
if (AUTOSTART) start();

