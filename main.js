var moment = require('moment');
var _ = require('underscore');

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


// write a function locationVenueLeaders to get all places with owner and high score within a geographical bound

// write function: getVenueHighScore that gets all team scores for a venue


Parse.Cloud.define("venueOwners", function(request, response){
	var TeamScore = Parse.Object.extend("TeamScore");
	var teamScoreQuery = new Parse.Query(TeamScore);
	var venueLeaders = {};
	var venuePointers = [];

	for (var i = 0; i < request.params.venues.length; i++) {
		var venue = {
						__type: "Pointer",
		        className: "Venue",
		        objectId: request.params.venues[i]
		};
		venuePointers.push(venue);
	}

	teamScoreQuery.containedIn('venue', venuePointers)
	.each(function(result) {
		var place = result.get('venue').toJSON().objectId;

		if ( (venueLeaders[place] && result.get('points') > venueLeaders[place].toJSON().points) || !venueLeaders[place] ) {
			venueLeaders[place] = result;
		} 

	}, {
		success : function (result){
			response.success(_.values(venueLeaders));
		},
		error : function (error){
			response.error(error)
		}
	})

});


// TODO: next time write the 'checkIn' call 
// how do we increment scores with a 'beforeSave' like below...
//  make sure to do a check if your teammates are also checked in on this location for score multiplier

// this function takes a userName (or Email), venue ID, and geolocation then 
// checks the user out of any previous venues and into the new venue 
// checks if any of the user's teammates are checked in and increments the score accordingly
// When you call response.success() in a beforeSave-handler, the object you handle is saved
Parse.Cloud.define("Checkin", function(request, response){

	var TeamScore = Parse.Object.extend("TeamScore");
	var teamScoreQuery = new Parse.Query(TeamScore);

	var userLocation = new Parse.Object("PlaceObject");
	var checkIn = Parse.Object.extend("Checkin");
	var checkInQuery = new Parse.Query(checkIn);

	// console.log(request.params);

	var userName = request.params['userName']; // userEmail also works
	var venue = request.params['venue'];
	var geo = request.params['geo']; // in this format {latitude: xxx, longitude: xxx}
	var password = request.params['password']; // how do we handle passwords securely?

	var point = new Parse.GeoPoint(geo);

	Parse.User.logIn('Tom', 'pass').then( function(user){
		console.log(user.toJSON().objectId);
		return checkInQuery.equalTo("userID", user.toJSON().objectId) 
	}).then(function(checkIn){
		console.log(checkIn);
		response.success(checkIn); // just a test to see if this works...
	})

});


Parse.Cloud.beforeSave("User", function(request, response){
	// var location = request.params.geo
	// var user = request.params.user
	// var venue = request.params.venue
	var query = new Parse.Query("Checkin")
});

