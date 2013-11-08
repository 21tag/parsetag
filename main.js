var moment = require('moment');

// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("team", function(request, response) {
  // response.success("Hello world!");
  var Team = Parse.Object.extend("Team")
  var team = new Parse.Query(Team);
  // console.log(team);
  team.find({
  	success: function(object) {
  		console.log('fuck yeah!');
  	},
  	error: function(err) {
  		console.log('fuck no!');
  	}
  });
});

var dateOfLastCheckin = function(user, venue){

};

var getVenueHighScore = function(venue){

};

Parse.Cloud.define("venueOwners", function(request, response){
	// this method gets venues and their respective owners
	// request data must include a 'venues' object containing an arbritrary number of venue IDs > 0
	// this method returns all venues specified
	var TeamScore = Parse.Object.extend("TeamScore");
	var Venue = Parse.Object.extend("Venue");
	var teamScoreQuery = new Parse.Query(TeamScore);
	var venueQuery = new Parse.Query(Venue);

	var venues = request.params.venues;
	var venueLeaders = [];
	var place;
	
	for (var i = 0; i < venues.length; i++) {
		venueQuery.find({
			success: function(obj) {
				console.log('someshit');
				console.log(obj);
				response.success(obj);
			},
			error: function(err) {
				response.error(err);
			}
		});
		
	}

	

});

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

