var forms = require('./forms.js');

const sessions = {};

const getSession = (alexaid) => {
	if(!(alexaid in sessions)){
		sessions[alexaid] = {
			state: 0,
			question: 0,
			scale: 0,
			answers: [],
			resultsDB: {}
		};
	}
	return alexaid;
};


// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
	try {
		console.log("RECIEVED EVENT: event.session.application.applicationId=" + event.session.application.applicationId);
		/**
		 * Uncomment this if statement and populate with your skill's application ID to
		 * prevent someone else from configuring a skill that sends requests to this function.
		 */

		// if (event.session.application.applicationId !== "") {
		//     context.fail("Invalid Application ID");
		//  }
		if (event.session.new) {
			onSessionStarted({requestId: event.request.requestId}, event.session);
		}

		if (event.request.type === "LaunchRequest") {
			onLaunch(event.request,
				event.session,
				function callback(sessionAttributes, speechletResponse) {
					context.succeed(buildResponse(sessionAttributes, speechletResponse));
				});
		} else if (event.request.type === "IntentRequest") {
			onIntent(event.request,
				event.session,
				function callback(sessionAttributes, speechletResponse) {
					context.succeed(buildResponse(sessionAttributes, speechletResponse));
				});
		} else if (event.request.type === "SessionEndedRequest") {
			onSessionEnded(event.request, event.session);
			context.succeed();
		}
	} catch (e) {
		context.fail("Exception: " + e);
	}
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
	// add any session init logic here
	// if the skill restarts set the session to 0
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
	getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
	var intent = intentRequest.intent;
	var intentName = intentRequest.intent.name;
	var id = getSession(session.sessionId);
	var state = sessions[id].state;
	console.log(sessions[id].state);
	// dispatch custom intents to handlers here
	if(intentName == "AMAZON.HelpIntent"){
		handleHelpRequest(intent, session, callback);
	}
	else if(intentName == "AMAZON.StopIntent" || intentName == "AMAZON.CancelIntent"){
		handleStop(intent, session, callback);
	}
	else if(state == 0){
		if(intentName == "newEntryIntent"){
			sessions[id].state = 1;
			handleEntry(intent, session, callback);
		}
		else if(intentName == "checkScoreIntent"){
			sessions[id].state = 3;
			var speechOutput = "When do you want to see your entries from?";
			callback(session.attributes, buildSpeechletResponse("My Mind", speechOutput, "", false));
		}
		else{
			handleErrorIntent(intent,session,callback);
		}
	}
	else if(state == 1){
		if (intentName == "depressionIntent"){
			sessions[id].scale = "depression";
		}
		else if (intentName == "anxietyIntent"){
			sessions[id].scale = "anxiety";
		}
		else if (intentName == "stressIntent"){
			sessions[id].scale = "stress";
		}
		else if (intentName == "generalIntent"){
			sessions[id].scale = "general";
		}
		else{
			handleErrorIntent(intent,session,callback);
		}
		if(sessions[id].scale != ""){
			handleIntro(intent, session, callback, forms[sessions[id].scale]);
		}
	}
	else if(state == 2){
		if(intentName == "answerIntent"){
			handleAnswer(intent, session, callback, forms[sessions[id].scale]);
		}
		else{
			handleErrorIntent(intent,session,callback);
		}
	}
	else if(state == 3){
		if(intentName == "dateIntent"){
			handleDate(intent, session, callback );
		}
		else{
			handleErrorIntent(intent,session,callback);
		}
	}
	else{
		handleErrorIntent(intent,session,callback);
	}
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {

}

// ------- Skill specific logic -------

function getWelcomeResponse(callback) {
	var speechOutput = "Welcome to the My Mind Skill. If you would like to make a new entry please say 'new entry'. If you would"+
		" like to check you scores please say 'check my scores'.";
	var reprompt = "";
	var header = "My Mind";
	var endSession = false;
	var sessionAttributes = {};
	callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, endSession));
}

function handleIntro(intent, session, callback, form){
	var id = getSession(session.sessionId);
	var header = "My Mind";
	var endSession = false;
	var speechOutput = form.intro + " " + form.questions[0];
	var reprompt = form.questions[0];
	sessions[id].state = 2;
	callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, endSession));
}

function handleAnswer(intent, session, callback, form){
	var id = getSession(session.sessionId);
	var header = "My Mind";
	var endSession = false;
	var speechOutput = "";
	var reprompt = "";
	var ans = parseInt(intent.slots.surveyAnswer.value);
	if(ans >= form.min && ans <= form.max){
		sessions[id].answers.push(ans);
		sessions[id].question++;
		if(sessions[id].question < form.questions.length){
			speechOutput = form.questions[sessions[id].question];
			reprompt = speechOutput;
		}
		else{
			var d = new Date();
			var key = d.getMonth()+1;
			if(key < 10){
				key = "0" + key;
			}
			key = d.getFullYear() + "-" + key + "-";
			var key_Prev = key;
			if(d.getDate() < 10){
				key += "0";
			}
			if(d.getDate() - 1 < 10){
				key_Prev += "0";
			}
			key += d.getDate();
			key_Prev += d.getDate() - 1;
			var key2 = d.getWeek();
			if(key2 < 10){
			    key2 = "0" + key2;
			}
			var key2 = d.getFullYear() + "-W" + key2;
			var results = forms[form.checker](sessions[id].answers);
			if(!(key in sessions[id].resultsDB)){
			    sessions[id].resultsDB[key] = {};
			}
			if(!(key_Prev in sessions[id].resultsDB)){
			    sessions[id].resultsDB[key_Prev] = {};
			}
			if(!(key2 in sessions[id].resultsDB)){
			    sessions[id].resultsDB[key2] = {};
			}
			sessions[id].resultsDB[key][sessions[id].scale] = {
				"answers": sessions[id].answers,
				"total": results[1],
				"result": form[results[0]]
			};
			sessions[id].resultsDB[key2][sessions[id].scale] = sessions[id].resultsDB[key][sessions[id].scale];
			sessions[id].resultsDB[key_Prev][sessions[id].scale] = sessions[id].resultsDB[key][sessions[id].scale];
			console.log(sessions[id].resultsDB);
			speechOutput = form[results[0]] + " If you would like to do another survey, please say 'new entry'. If you would"+
				" like to check your scores, please say, 'check my scores'. Otherwise, say 'quit' to exit the skill.";
			sessions[id].answers = [];
			sessions[id].scale = "";
			sessions[id].state = 0;
			sessions[id].question = 0;
			reprompt = "";
		}
	}
	else{
		speechOutput = "Please choose a number between " + form.min + " and " + form.max + ".";
		reprompt = form.questions[sessions[id].question];
	}
	callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, endSession));
}

function handleHelpRequest(intent, session, callback) {
	var id = getSession(session.sessionId);
	var header = "My Mind";
	var endSession = false;
	var speechOutput = "";
	var reprompt = "";
	if(sessions[id].state == 0){
		speechOutput = "To create a new entry and help track your mental health go ahead and say, 'new entry'. Or if you would like "+
			"to quit, go ahead and say 'quit'.";
		reprompt = speechOutput;
	}
	else if(sessions[id].state == 1){
		speechOutput = "To select which mental health entry you would like to make go ahead and say one of the following, "+
			"depression, anxiety, stress, or general. You will then be given a set of statements to rate and your results will be returned based off "+
			"of a clinically used scale.";
		reprompt = speechOutput;
	}
	else if(sessions[id].state == 2){
		var form = forms[sessions[id].scale];
		speechOutput = form.help + " " + form.questions[sessions[id].question];
		reprompt = speechOutput;
	} 
	callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, endSession));
}

function handleDate(intent, session, callback){
	var id = getSession(session.sessionId);
	var header = "My Mind";
	var endSession = false;
	var speechOutput = "Here are the results from that time: ";
	// get date slot
	var key = intent.slots.date.value;
	// get suggested year
	var year = parseInt(key.substr(0, 4));
	var d = new Date();
	// make sure year is on or before curren year
	while(year > d.getFullYear()){
		year--;
	}
	// if in future subtract year by 1 for week format
	if(year == d.getFullYear() && key.substr(5, 1) == "W" && parseInt(key.substr(6, 2)) > d.getWeek()){
		console.log("week");
		year--;
	}
	// for day month format
	else if(year == d.getFullYear() && parseInt(key.substr(5, 2)) > (d.getMonth() + 1)){
		console.log("day");
		year--;
	}
	console.log(year);
	// add corrected year
	key = year + key.substr(4);
	console.log(key);
	// check if there is entry for date
	if(key in sessions[id].resultsDB){
		var data = sessions[id].resultsDB[key];
		var entry;
		// go through completed forms from the time
	    for(var i = 0; i < Object.keys(data).length; i++){
	    	entry = data[Object.keys(data)[i]];
	    	speechOutput += "For the " + Object.keys(data)[i] + " test, you recieved a result of " + entry.total + ". " + entry.result + " ";
	    }
	}
	// no entry for date
	else{
		speechOutput = "Sorry, I have no records for that time. ";
	}
	// set program to begining
	sessions[id].state = 0;
	var reprompt = "If you would like to make a new entry please say 'new entry'. If you would like to check you scores please say 'check my scores'.";
	speechOutput += reprompt;
	callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, endSession));
}

function handleStop(intent, session, callback){
	var id = getSession(session.sessionId);
	var header = "My Mind";
	var endSession = true;
	var speechOutput = "Thank you for playing!";
	var reprompt = "";
	sessions[id].state = 0;
	callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, endSession));
}

function handleEntry(intent, session, callback){
	var id = getSession(session.sessionId);
	var header = "My Mind";
	var endSession = false;
	var speechOutput = " Which entry would you like to make today? You can do depression, anxiety, stress, or general.";
	var reprompt = "Please say the name of the entry you would like to create.";
	callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, endSession));
}

function handleErrorIntent(intent, session, callback){
	var id = getSession(session.sessionId);
	var header = "My Mind";
	var endSession = false;
	var speechOutput = " I'm sorry, I didn't understand that response. Please try again or say 'help' for instructions.";
	var reprompt = speechOutput;
	callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, endSession));
}

// Returns the ISO week of the date.
Date.prototype.getWeek = function() {
	var date = new Date(this.getTime());
	date.setHours(0, 0, 0, 0);
	// Thursday in current week decides the year.
	date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
	// January 4 is always in week 1.
	var week1 = new Date(date.getFullYear(), 0, 4);
	// Adjust to Thursday in week 1 and count number of weeks from date to week1.
	return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

// ------- Helper functions to build responses for Alexa -------
function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
	return {
		outputSpeech: {
			type: "PlainText",
			text: output
		},
		card: {
			type: "Simple",
			title: title,
			content: output
		},
		reprompt: {
			outputSpeech: {
				type: "PlainText",
				text: repromptText
			}
		},
		shouldEndSession: shouldEndSession
	};
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
	return {
		outputSpeech: {
			type: "PlainText",
			text: output
		},
		reprompt: {
			outputSpeech: {
				type: "PlainText",
				text: repromptText
			}
		},
		shouldEndSession: shouldEndSession
	};
}

function buildResponse(sessionAttributes, speechletResponse) {
	return {
		version: "1.0",
		sessionAttributes: sessionAttributes,
		response: speechletResponse
	};
}
