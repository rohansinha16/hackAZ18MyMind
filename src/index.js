var forms = require('./forms.js');

const sessions = {};


const getSession = (alexaid) => {
    if(!(alexaid in sessions)){
        sessions[alexaid] = {
            state: 0,
            question: 0,
            stage: 0,
            answers: []
        };
    }
    return alexaid;
};

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    console.log("recieved event");
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

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
    sessions[session.sessionId]
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

    // dispatch custom intents to handlers here
    if(session.stage == 0){
        if(intentName == "AMAZON.HelpIntent"){
            handleGetHelpRequest(intent, session, callback);
        }
        else if(intentName == "AMAZON.StopIntent" || intentName == "AMAZON.CancelIntent"){
            handleStop(intent, session, callback);
        }
        else if(intentName == "newEntryIntent"){
            session.stage = 1;
            handleEntry(intent, session, callback);
        }
        else{
            throw "Invalid intent";
        }
    }
    if(session.stage == 1){
        if(intentName == "AMAZON.HelpIntent"){
            handleGetHelpRequest(intent, session, callback);
        }
        else if(intentName == "AMAZON.StopIntent" || intentName == "AMAZON.CancelIntent"){
            handleStop(intent, session, callback);
        }
        else if (intentName == "depressionIntent"){}
        else if (intentName == "anxietyIntent"){}
        else if (intentName == "sleepIntent"){}
        else if (intentName == "stressIntent"){}
    }
    
    else if(intentName == "AMAZON.YesIntent"){
        handleYes(intent, session, callback);
       }
    else if(intentName == "answerIntent"){
        handleAnswer(intent, session, callback, forms.depression, forms.diagnosisDep);
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
        " like to check you average scores please say 'check my scores'.";
    var reprompt = "";
    var header = "My Mind";
    var endSession = false;
    var sessionAttributes = {};
    callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, endSession));
}

function handleYes(intent, session, callback){
    var id = getSession(session.sessionId);
    var header = "My Mind";
    var endSession = false;
    console.log("attempt to use form");
    var depression = forms.depression;
    console.log("opened form");
    var speechOutput = depression.intro + " " + depression.questions[0];
    console.log(speechOutput);
    var reprompt = depression.questions[0];
    callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, endSession));
}

function handleAnswer(intent, session, callback, form, check){
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
            speechOutput = form[check(sessions[id].answers)];
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

}

function handleStop(intent, session, callback){
    var id = getSession(session.sessionId);
    var header = "My Mind";
    var endSession = true;
    var speechOutput = "Thank you for playing!";
    var reprompt = "";
    delete(sessions[id]); 
    callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, endSession));
}

function handleEntry(intent, session, callback){
    var id = getSession(session.sessionId);
    var header = "My Mind";
    var endSession = false;
    var speechOutput = " Which entry would you like to make today? You can do depression, anxiety, sleep, or stress."
    var reprompt = "Please say the name of the entry you would like to create.";
    callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, endSession));
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
