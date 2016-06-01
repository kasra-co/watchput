'use strict';

console.log("initialized");

module.exports.handler = function(event, context, cb) {
	if (event) {
		console.log("event:", JSON.stringify(event));
	} else {
		console.log("No event");
	}

	return cb(null, {
		event: event,
		message: 'Go Serverless! Your Lambda function executed successfully!'
	});
};
