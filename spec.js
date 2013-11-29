// TODO: add require statements here
// Jasmine, simple HTTPRequest module, underscore, etc.

var stubs = require("stubs");
var http = require('http-get');
var fs = require("fs");

var config = JSON.parse(fs.readFileSync("#{process.cwd()}/config.json", "utf-8"));
// see http://saltwaterc.github.io/http-request/module-main.html#post


// TODO: Is it possible to rewrite this as a GET request and modify/eliminate our VenueOwners function
//  --data-urlencode 'where={"VenueScore":{"$select":{"venue":[array of venueIDs]}}' \ 
//  --data-urlencode 'order=name, -score \
//  --data-urlencode 'limit=1' \


describe("venueOwners", function () {

		// for Buffer reqBody, the content-lenght header is reqBody.lenght

  it("Should return the leader of each venue in an options array", function() {
		var reqBody = {
		  "venues": [
		  "SIf03bKMSL", "kiksq1qH4s" // note that these venueIDs may change
		  ]
		};

		// this serialization also does URL encoding so you won't have to
		reqBody = querystring.stringify(reqBody);

		expect(http.post({
			url: 'https://api.parse.com/1/functions/venueOwners',
			reqBody: reqBody,
			headers: {
				// specify how to handle the request, http-request makes no assumptions
				'content-type': 'application/json',
				'X-Parse-REST-API-Key': config.key,
				'X-Parse-Application-Id': "#{config.id}" // I'm not sure if we need this syntax of the other (above)?

			}
		}, 'post.bin', function (err, res) {
			if (err) {
				console.error(err);
				return;
			}
			console.log(res);
			return res.lenght;
		})).toEqual(2);

	});

});