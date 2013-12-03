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



// TODO: Here is the syntax for a GET request 
//  --data-urlencode 'where={"VenueScore":{"$select":{"venue":[array of venueIDs]}}' \ 
//  --data-urlencode 'order=name, -score \
//  --data-urlencode 'limit=1' \

// write a query that gets all places with owner and high score within a geographical bound

// write a query that gets all scores for a venue



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


// Client-side - confirm the player is within 200 meters of venue
// afterSave Checkout - update VenueScore, TeamScore, and UserScore




// TODO: write a helper function to manage score-keeping (params: venue && team)
// get the number of teammates checked in at the venue (in last 5 minutes)
// update score for VenueScore, TeamScore, and UserScore

// example two teammates checkin to the same location for 5 minutes
// each player gets 5 points and the team gets 20 points at that venue
// When you call response.success() in a beforeSave-handler, the object you handle is saved


// "Checkin" takes a sessionToken, venue ID, & (optional) checkinID 
Parse.Cloud.define("Checkin", function(request, response){

	var TeamScore = Parse.Object.extend("TeamScore");
	var teamScoreQuery = new Parse.Query(TeamScore);

	var checkIn = Parse.Object.extend("Checkin");
	var checkInQuery = new Parse.Query(checkIn);

	var Venue = Parse.Object.extend("Venue");
	var venueQuery = new Parse.Query(Venue); 

	var checkinID = request.params['checkin'] || undefined;

	var venueID = request.params['venue'];

	var user = Parse.User.current();

	var venue;

	venueQuery.get(venueID).then(function(result){
		venue = result;

		if (checkinID) {
			checkInQuery.get(checkinID).then(function(result){
				oldCheckin = result;
				previousTime = oldCheckin.get('endTime').toJSON();
				console.log(previousTime);
				console.log(moment(previousTime));
				minutes = moment.utc().diff(moment(previousTime), 'minutes');
				response.success(minutes); 
			}, function(error){
				response.error(error);
			});
		} else {
			var newCheckin = new Parse.Object('Checkin');
			newCheckin.set('user', user);
			newCheckin.set('venue', venue);
			newCheckin.set('endTime', new Date());
			newCheckin.save(null, {
				success: function(object){
					response.success(object);
				},
				error: function(error){
					response.error(error)
				}
			});
		}

	}, function(error){
		console.log(error);
	})


});


Parse.Cloud.beforeSave("User", function(request, response){
	// var location = request.params.geo
	// var user = request.params.user
	// var venue = request.params.venue
	var query = new Parse.Query("Checkin")
});

