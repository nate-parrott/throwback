function startTrip(scene) {
	$.get('trip.json', function(trip) {
		var moment = new Moment(trip.moments[0]);
		moment.show(scene, null);
	})
}
