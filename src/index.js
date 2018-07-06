var forms = require('./forms.js');
var Alexa = require('alexa-sdk');
let AWS = require('aws-sdk');

var sessions = {};

const handlers = {
	'LaunchRequest' : function() {
		getSession(this);
		onLaunch(this.event.request,
			this.event.session,
			function callback(sessionAttributes, speechletResponse) {
				this.context.succeed(buildResponse(sessionAttributes, speechletResponse));
		});
	},
	'IntentRequest' : function() {
		onIntent(this.event.request,
			this.event.session,
			function callback(sessionAttributes, speechletResponse) {
				this.context.succeed(buildResponse(sessionAttributes, speechletResponse));
			}, this);
	},
	'SessionEndedRequest' : function() {
		onSessionEnded(this.event.request, this.event.session);
		this.context.succeed();
	},
	'Unhandled' : function() {
		onIntent(this.event.request,
			this.event.session,
			function callback(sessionAttributes, speechletResponse) {
				this.context.succeed(buildResponse(sessionAttributes, speechletResponse));
			}, this);
	}

}

exports.handler = function(event, context, callback) {
	var alexa = Alexa.handler(event, context);
	alexa.dynamoDBTableName = '<TABLE-NAME-HERE>';
	alexa.appId = '<APP-ID-HERE>';
	alexa.registerHandlers(handlers)
	this.context = context;
	alexa.execute();
}


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
function onIntent(intentRequest, session, callback, alexa) {
	var intent = intentRequest.intent;
	var intentName = intentRequest.intent.name;
	var state = sessions.state;
	//console.log(sessions.state);
	// dispatch custom intents to handlers here
	if(intentName == "AMAZON.HelpIntent"){
		handleHelpRequest(intent, session, callback);
	}
	else if(intentName == "AMAZON.StopIntent" || intentName == "AMAZON.CancelIntent"){
		handleStop(intent, session, callback, alexa);
	}
	else if(state == 0){
		if(intentName == "newEntryIntent"){
			sessions.state = 1;
			handleEntry(intent, session, callback);
		}
		else if(intentName == "checkScoreIntent"){
			sessions.state = 3;
			var speechOutput = "When do you want to see your entries from?";
			callback(session.attributes, buildSpeechletResponse("My Mind", speechOutput, "", false));
		}
		else{
			handleErrorIntent(intent,session,callback);
		}
	}
	else if(state == 1){
		if (intentName == "depressionIntent"){
			sessions.scale = "depression";
		}
		else if (intentName == "anxietyIntent"){
			sessions.scale = "anxiety";
		}
		else if (intentName == "stressIntent"){
			sessions.scale = "stress";
		}
		else if (intentName == "generalIntent"){
			sessions.scale = "general";
		}
		else{
			handleErrorIntent(intent,session,callback);
		}
		if(sessions.scale != ""){
			handleIntro(intent, session, callback, forms[sessions.scale]);
		}
	}
	else if(state == 2){
		if(intentName == "answerIntent"){
			//console.log(session.user.userId)
			handleAnswer(intent, session, callback, forms[sessions.scale], alexa);
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
	sessions = {};
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
	var header = "My Mind";
	var endSession = false;
	var speechOutput = form.intro + " " + form.questions[0];
	var reprompt = form.questions[0];
	sessions.state = 2;
	callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, endSession));
}

function handleAnswer(intent, session, callback, form, alexa){
	var header = "My Mind";
	var endSession = false;
	var speechOutput = "";
	var reprompt = "";
	var ans = parseInt(intent.slots.surveyAnswer.value);
	if(ans >= form.min && ans <= form.max){
		sessions.answers.push(ans);
		sessions.question++;
		if(sessions.question < form.questions.length){
			speechOutput = form.questions[sessions.question];
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
			var results = forms[form.checker](sessions.answers);
			if(!(key in sessions.resultsDB)){
			    sessions.resultsDB[key] = {};
			}
			if(!(key_Prev in sessions.resultsDB)){
			    sessions.resultsDB[key_Prev] = {};
			}
			if(!(key2 in sessions.resultsDB)){
			    sessions.resultsDB[key2] = {};
			}
			sessions.resultsDB[key][sessions.scale] = {
				"answers": sessions.answers,
				"total": results[1],
				"result": form[results[0]]
			};
			sessions.resultsDB[key2][sessions.scale] = sessions.resultsDB[key][sessions.scale];
			sessions.resultsDB[key_Prev][sessions.scale] = sessions.resultsDB[key][sessions.scale];
			speechOutput = form[results[0]] + " If you would like to do another survey, please say 'new entry'. If you would"+
				" like to check your scores, please say, 'check my scores'. Otherwise, say 'stop' to exit the skill.";
			sessions.answers = [];
			sessions.scale = "";
			sessions.state = 0;
			sessions.question = 0;
			reprompt = "";
			saveSession(alexa);
		}
	}
	else{
		speechOutput = "Please choose a number between " + form.min + " and " + form.max + ".";
		reprompt = form.questions[sessions.question];
	}
	callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, endSession));
}

function handleHelpRequest(intent, session, callback) {
	var header = "My Mind";
	var endSession = false;
	var speechOutput = "";
	var reprompt = "";
	if(sessions.state == 0){
		speechOutput = "To create a new entry and help track your mental health go ahead and say, 'new entry'. Or if you would like "+
			"to quit, go ahead and say 'stop'.";
		reprompt = speechOutput;
	}
	else if(sessions.state == 1){
		speechOutput = "To select which mental health entry you would like to make go ahead and say one of the following, "+
			"depression, anxiety, stress, or general. You will then be given a set of statements to rate and your results will be returned based off "+
			"of a clinically used scale.";
		reprompt = speechOutput;
	}
	else if(sessions.state == 2){
		var form = forms[sessions.scale];
		speechOutput = form.help + " " + form.questions[sessions.question];
		reprompt = speechOutput;
	} 
	callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, endSession));
}

function handleDate(intent, session, callback){
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
		//console.log("week");
		year--;
	}
	// for day month format
	else if(year == d.getFullYear() && parseInt(key.substr(5, 2)) > (d.getMonth() + 1)){
		//console.log("day");
		year--;
	}
	//console.log(year);
	// add corrected year
	key = year + key.substr(4);
	//console.log(key);
	// check if there is entry for date
	if(key in sessions.resultsDB){
		var data = sessions.resultsDB[key];
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
	sessions.state = 0;
	var reprompt = "If you would like to make a new entry please say 'new entry'. If you would like to check you scores please say 'check my scores'.";
	speechOutput += reprompt;
	callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, endSession));
}

function handleStop(intent, session, callback, alexa){
	var header = "My Mind";
	var endSession = true;
	var speechOutput = "Have a nice day!";
	var reprompt = "";
	sessions.state = 0;
	sessions.answers = [];
	sessions.question = 0;
	sessions.scale = 0;
	saveSession(alexa);
	sessions = {}
	callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, endSession));
}

function handleEntry(intent, session, callback){
	var header = "My Mind";
	var endSession = false;
	var speechOutput = " Which entry would you like to make today? You can do depression, anxiety, stress, or general.";
	var reprompt = "Please say the name of the entry you would like to create.";
	callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, endSession));
}

function handleErrorIntent(intent, session, callback){
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

function getSession(alexa){
	if(typeof alexa.attributes["session"] == 'undefined'){
		sessions = {
			state: 0,
			question: 0,
			scale: 0,
			answers: [],
			resultsDB: {}
		};
		alexa.attributes["session"] = sessions; 
		console.log("NEW: " + alexa.attributes["session"])
	} else{
		console.log("EXISTS: " + alexa.attributes["session"].state)
		console.log("EXISTS: " + alexa.attributes["session"].answers)
		console.log("EXISTS: " + alexa.attributes["session"].resultsDB)
		console.log("EXISTS: " + alexa.attributes["session"].scale)
		sessions = alexa.attributes["session"];
	}
	saveSession(alexa);
}

function saveSession(alexa){
	alexa.attributes["session"] = sessions;
	return alexa.emit(':saveState', true);
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
