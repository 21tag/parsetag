var moment = require('moment');
var _ = require('underscore');

// TODO: Here is the syntax for a GET request 
//  --data-urlencode 'where={"VenueScore":{"$select":{"venue":[array of venueIDs]}}' \ 
//  --data-urlencode 'order=name, -score \
//  --data-urlencode 'limit=1' \


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


// This is a helper function to manage score-keeping (params: venue && team)
// get the number of teammates checked in at the venue (in last 5 minutes)
// update score for VenueScore, TeamScore, and UserScore

// example two teammates checkin to the same location for 5 minutes
// each player gets 5 points and the team gets 20 points at that venue

var scoreUpdateHelper = function(user, minutes, venueID, cbObject){ // should we pass 'team' too?
	var UserScore = Parse.Object.extend('UserScore');
	var userScoreQuery = new Parse.Query(UserScore);

	var TeamScore = Parse.Object.extend("TeamScore");
	var teamScoreQuery = new Parse.Query(TeamScore);

  var userQuery = new Parse.Query(Parse.User);

	var checkIn = Parse.Object.extend("Checkin");
	var checkInQuery = new Parse.Query(checkIn);

	var team = user.get('team');

	var teammates, multiplier, userscore;

	var newTeamScore = new Parse.Object('TeamScore');

	var venue = {
						__type: "Pointer",
		        className: "Venue",
		        objectId: venueID
	};

	userQuery.equalTo('team', team)
	.find()
	.then(function(result) {
		teammates = result;
		var now = new Date();
		var fiveMinutesAgo = moment().subtract("m", 5).toDate();

		checkInQuery.containedIn('user', teammates)
		.equalTo('venue', venue).greaterThan('endTime', fiveMinutesAgo)
		.find()
		.then(function(result) {
			multiplier = result.length || 1;

			userScoreQuery.equalTo('venue', venue)
				.equalTo('user', user)
				.equalTo('team', team)
				.find({
					success : function(result){
						if (result.length === 0) {
							userscore = = new Parse.Object('UserScore');
							userscore.save({
								"team": team,
								"user": user,
								"venue": venue,
								"points": minutes
							});
						} else {
							result[0].increment('points', minutes);
							result[0].save();
							userscore = result[0];
						};
					},
					error : function(error){
						response.error(error);
					}
				}).then(function(){
					teamScoreQuery.equalTo('venue', venue)
						.equalTo('team', team)
						.find({
							success : function(result) {
								if (result.length === 0) {
									newTeamScore.save({
										'team': team,
										'venue': venue,
										'points': minutes * multiplier
									});
									cbObject.success({ 'teamscore' : newTeamScore, 'userscore' : newUserScore })
								} else {
									result[0].increment('points', minutes * multiplier);
									result[0].save();
									cbObject.success({ 'teamscore' : result[0], 'userscore' : userscore });			
								}
							}
						})
				})
		},
		function(error) {
			cbObject.error(error);
		});
	},
	function(error) {
		cbObject.error(error);
	});

}


// When you call response.success() in a beforeSave-handler, the object you handle is saved


// "Checkin" takes a sessionToken, venue ID, & (optional) checkinID 
Parse.Cloud.define("Checkin", function(request, response){

	var checkIn = Parse.Object.extend("Checkin");
	var checkInQuery = new Parse.Query(checkIn);

  var userQuery = new Parse.Query(Parse.User);

	var UserScore = Parse.Object.extend('UserScore');
	var userScoreQuery = new Parse.Query(UserScore);

	var Venue = Parse.Object.extend("Venue");
	var venueQuery = new Parse.Query(Venue); 

	var checkinID = request.params['checkin'] || undefined;

	var venueID = request.params['venue'];

	var user = Parse.User.current();

	var venue = {
						__type: "Pointer",
		        className: "Venue",
		        objectId: venueID
	};

	console.log(user);

	user.set('currentVenue', venue);

	user.save(null, {
		success : function(result) {
			console.log(result);
		},
		error : function(error) {
			console.log('error block');
			console.log(error);
			response.error(error);
		}
	}).then(function(){
		console.log('wtf');
	});

	venueQuery.get(venueID).then(function(result){
		venue = result;

		if (checkinID) {
			checkInQuery.get(checkinID).then(function(result){
				oldCheckin = result;
				previousTime = oldCheckin.get('endTime').toJSON();
				oldCheckin.set('endTime', new Date());
				oldCheckin.save(null, {
					success: function(object){
						scoreUpdateHelper(user, minutes, venueID, {
							success: function(object){
								response.success(object);
							},
							error: function(error){
								response.error(error);
							}});
						// response.success(object);
					},
					error: function(error){
						response.error(error)
					}
				});
				minutes = moment.utc().diff(moment(previousTime), 'minutes');
				// response.success(minutes);
			}, function(error){
				response.error(error);
			});
		} else {
			var newCheckin = new Parse.Object('Checkin');
			newCheckin.save({'endTime': new Date(), 'venue': venue, 'user': user}, {
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


// Parse.Cloud.beforeSave("User", function(request, response){
// 	// var location = request.params.geo
// 	// var user = request.params.user
// 	// var venue = request.params.venue
// 	var query = new Parse.Query("Checkin")
// });

