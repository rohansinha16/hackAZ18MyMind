var forms = require('./forms.js');

const sessions = {};

const getSession = (alexaid) => {
    if(!(alexaid in sessions)){
        sessions[alexaid] = {
            state: 0,
            question: 0,
            scale: 0,
            answers: []
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
    sessions[session.sessionId];
    // if the skill restarts set the session to 0
    // can possibly handle this differently
    sessions[getSession()].state = 0;
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
    var state = sessions[getSession()].state;
    console.log(sessions[getSession()].state);
    // dispatch custom intents to handlers here
    if(state == 0){
        if(intentName == "AMAZON.HelpIntent"){
            handleHelpRequest(intent, session, callback);
        }
        else if(intentName == "AMAZON.StopIntent" || intentName == "AMAZON.CancelIntent"){
            handleStop(intent, session, callback);
        }
        else if(intentName == "newEntryIntent"){
            sessions[getSession()].state = 1;
            handleEntry(intent, session, callback);
        }
        else{
            handleErrorIntent(intent,session,callback);
        }
    }
    else if(state == 1){
        if(intentName == "AMAZON.HelpIntent"){
            handleHelpRequest(intent, session, callback);
        }
        else if(intentName == "AMAZON.StopIntent" || intentName == "AMAZON.CancelIntent"){
            handleStop(intent, session, callback);
        }
        else if (intentName == "depressionIntent"){
            sessions[getSession()].scale = 0;
            handleDepression(intent, session, callback);
        }
        else if (intentName == "anxietyIntent"){
            sessions[getSession()].scale = 1;
            handleAnxiety(intent, session, callback);
        }
        else if (intentName == "sleepIntent"){
            sessions[getSession()].scale = 2;
            handleSleep(intent, session, callback);
        }
        else if (intentName == "stressIntent"){
            sessions[getSession()].scale = 3;
            handleStress(intent, session, callback);
        }
        else{
            handleErrorIntent(intent,session,callback);
        }
    }
    else if(state == 2){
        var scale = sessions[getSession()].scale
        if(intentName == "AMAZON.HelpIntent"){
            if(scale == 0){
                handleHelpRequest(intent, session, callback, forms.depression);
            }
            else if (scale == 1){
                handleHelpRequest(intent, session, callback, forms.anxiety);
            }
            else if (scale == 2){
                handleHelpRequest(intent, session, callback, forms.sleep);
            }
            else if (scale == 3){
                handleHelpRequest(intent, session, callback, forms.stress);
            }
        }
        else if(intentName == "AMAZON.StopIntent" || intentName == "AMAZON.CancelIntent"){
            handleStop(intent, session, callback);
        }
        else if(intentName == "answerIntent"){
            if(scale == 0){
                handleAnswer(intent, session, callback, forms.depression,forms.diagnosisDep);
            }
            else if (scale == 1){
                handleAnswer(intent, session, callback, forms.anxiety,forms.diagnosisAnx);
            }
            else if (scale == 2){
                handleAnswer(intent, session, callback, forms.sleep,forms.diagnosisSlp);
            }
            else if (scale == 3){
                handleAnswer(intent, session, callback, forms.stress,forms.diagnosisStr);
            }
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
        " like to check you average scores please say 'check my scores'.";
    var reprompt = "";
    var header = "My Mind";
    var endSession = false;
    var sessionAttributes = {};
    callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, endSession));
}

function handleDepression(intent, session, callback){
    var id = getSession(session.sessionId);
    var header = "My Mind";
    var endSession = false;
    var depression = forms.depression;
    var speechOutput = depression.intro + " " + depression.questions[0];
    var reprompt = depression.questions[0];
    sessions[getSession()].state = 2;
    callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, endSession));
}

function handleAnxiety(intent, session, callback){
    var id = getSession(session.sessionId);
    var header = "My Mind";
    var endSession = false;
    var anxiety = forms.anxiety;
    var speechOutput = anxiety.intro + " " + anxiety.questions[0];
    var reprompt = anxiety.questions[0];
    sessions[getSession()].state = 2;
    callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, endSession));
}

function handleStress(intent, session, callback){
    var id = getSession(session.sessionId);
    var header = "My Mind";
    var endSession = false;
    var stress = forms.stress;
    var speechOutput = stress.intro + " " + stress.questions[0];
    var reprompt = stress.questions[0];
    sessions[getSession()].state = 2;
    callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, endSession));
}

function handleSleep(intent, session, callback){
    var id = getSession(session.sessionId);
    var header = "My Mind";
    var endSession = false;
    var sleep = forms.sleep;
    var speechOutput = sleep.intro + " " + sleep.questions[0];
    var reprompt = sleep.questions[0];
    sessions[getSession()].state = 2;
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

function handleHelpRequest(intent, session, callback, form) {
    var id = getSession(session.sessionId);
    var header = "My Mind";
    var endSession = false;
    var speechOutput = "";
    var reprompt = "";
    if(sessions[getSession()].state == 0){
        speechOutput = "To create a new entry and help track your mental health go ahead and say, 'new entry'. Or if you would like "+
            "to quit, go ahead and say 'quit'.";
        reprompt = speechOutput;
    }
    else if(sessions[getSession()].state == 1){
        speechOutput = "To select which mental health entry you would like to make go ahead and say one of the following, "+
            "depression, anxiety, sleep, or stress. You will then be given a set of statements to rate and your results will be returned based off "+
            "of a clinically used scale.";
        reprompt = speechOutput;
    }
    else if(sessions[getSession()].state == 2){
        speechOutput = form.help + " " + form.questions[sessions[id].question];
        reprompt = speechOutput;
    } 
    callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, endSession));
}

function handleStop(intent, session, callback){
    var id = getSession(session.sessionId);
    var header = "My Mind";
    var endSession = true;
    var speechOutput = "Thank you for playing!";
    var reprompt = "";
    //Probably don't want to delete on exit, make a new intent to handle deleteion of data. Reset skill stage instead.
    //delete(sessions[id]); 
    sessions[getSession()].state = 0;
    callback(session.attributes, buildSpeechletResponse(header, speechOutput, reprompt, endSession));
}

function handleEntry(intent, session, callback){
    var id = getSession(session.sessionId);
    var header = "My Mind";
    var endSession = false;
    var speechOutput = " Which entry would you like to make today? You can do depression, anxiety, sleep, or stress.";
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
