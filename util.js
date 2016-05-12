function quaternionFromLatLng(lat, lng) {
	var y = (90 - lat) * Math.PI / 180;
	var x = (-lng + 90) * Math.PI / 180;

	var q1 = new THREE.Quaternion();
	q1.setFromAxisAngle(new THREE.Vector3(1, 0, 0), y);
	var q2 = new THREE.Quaternion();
	q2.setFromAxisAngle(new THREE.Vector3(0, 1, 0), x);

	var q = new THREE.Quaternion();
	q.multiplyQuaternions(q1, q2);
	return q;
}

function easeInOutCubic(t, b, c, d) {
	if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
	return c / 2 * ((t -= 2) * t * t + 2) + b;
}

function easeInCubic(t, b, c, d) {
	return c * (t /= d) * t * t + b;
}

function easeOutCubic(t, b, c, d) {
	return c * ((t = t / d - 1) * t * t + 1) + b;
}

function easeInOut(t) {
	return easeInOutCubic(t, 0, 1, 1);
}

function easeIn(t) {
	return easeInCubic(t, 0, 1, 1);
}

function easeOut(t) {
	return easeOutCubic(t, 0, 1, 1);
}

var wasLow = false;
function setObjectOpacity(obj, opacity) {
	obj.traverse(function(child) {
		_setObjectOpacityIndividual(child, opacity);
	})
}

function _setObjectOpacityIndividual(obj, opacity) {
	if (obj.material) {
		if (opacity <= 0) {
			obj.visible = false;
			obj._hiddenByOpacity = true;
		} else {
			if (!obj.visible && obj._hiddenByOpacity) {
				obj.visible = true;
				delete obj._hiddenByOpacity;
			}
			obj.material.transparent = true;
			obj.material.opacity = opacity;
		}
	}
}

function quaternionBetweenVectors(v1, v2) {
	var q = new THREE.Quaternion();
	q.setFromUnitVectors(v1, v2);
	return q;
}

function concatQuaternions(q1, q2) {
	var q = new THREE.Quaternion();
	q.multiplyQuaternions(q1, q2);
	return q;
}

function getVectorDiffDirection(v1, v2) {
	if (v1.equals(v2)) return 0;
	var x = new THREE.Vector3();
	x.crossVectors(v1, v2);
	return x.y > 0 ? 1 : -1;
}
