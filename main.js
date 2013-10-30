var moment = require('moment');


// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

var dateOfLastCheckin = function(user, venue){

};

var getVenueHighScore = function(venue){

};

Parse.Cloud.define("venueOwners", function(request, response){
	// this method gets venues and their respective owners
	// request data must include a 'venues' object containing an arbritrary number of venue IDs > 0
	// this method returns all venues specified
	var teamQuery = new Parse.Query("TeamScore");
	var venueQuery = new Parse.Query("Venue");
	var venues = request.object.get('venues');
	var venueLeaders = [];
	for (var i = 0; i < venues.length; i++) {
		Query.get(venues[i], {
			success: function(venue){
				teamQuery.equalTo("venue", venue);
				teamQuery.descending("points");
				teamQuery.first({
					success: function(leader) {
						var dict;
						dict.venue = venue.objectId;
						dict.leader = leader.objectId;
						dict.score = leader.points;
						venueLeaders.push(dict);
					},
					error: function(err) {
						console.log(err);
						response.error(err);
					}
				});
			},
			error: function(err){
				console.log(err);
				ressponse.error(err);
				break;
			}
		};
	};
	response.success(venueLeaders);
})

Parse.Cloud.beforeSave("Checkin", function(request, response){
	var query = new Parse.Query("Checkin");
	var user = request.object.get('user');
	var venue = request.object.get('venue');
	var userLocation = request.get('geo');
	// if Checkin && Checkin.active
});


Parse.Cloud.beforeSave("User", function(request, response){
	// var location = request.params.geo
	// var user = request.params.user
	// var venue = request.params.venue
	var query = new Parse.Query("Checkin")
});

