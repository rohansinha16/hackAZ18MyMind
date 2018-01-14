exports.depression = {
	min: 0,
	max: 4,
	intro: "In this Depression Scale, I will be asking you 20 questions on" +
		" the ways you may have felt or behaved over the past week or so. Please" +
		" respond to these questions with a 0, 1, 2, 3, or 4; 0 meaning not at all or" +
		" less than 1 day and 4 being nearly every day for 2 weeks. Lets begin.",
	outrto: "Your entry has been logged. This scale was built using" +
		" the Center for Epidemiologic Studies Depression Scale – Revised (CESD-R)." +
		" Please visit http://cesd-r.com/ for more information.",
	help: "To answer these questions, please say a number between 0 and 4." +
		" 0 indicates not at all or less than 1 day. 1 indicates 1 to 2 days." +
		" 2 indicates 3 to 4 days. 3 indicates 5 to 7 days. And 4 indicates nearly" +
		" everyday for 2 weeks. Lets resume. ",
	checker: "diagnosisDep",
	majorDep: "Based on the scores you have provided; your possible depressive symptom category is Major Depressive Episode.",
	ProbableMajorDepressiveEpisode: "Based on the scores you have provided; your possible depressive symptom category is Probable Major Depressive Episode.",
	PossibleMajorDepressiveEpisode: "Based on the scores you have provided; your possible depressive symptom category is Possible major depressive episode.",
	SubthreshholdDepressionSymptoms: "Based on the scores you have provided; your possible depressive symptom category is Subthreshhold depression symptoms.",
	NoClinicalSignificance: "Based on the scores you have provided; your possible depressive symptom category shows no clinical significance.",
	questions: [ 
		"My appetite was poor",
		"I could not shake off the blues",
		"I had trouble keeping my mind on what I was doing",
		"I felt depressed",
		"My sleep was restless",
		"I felt sad",
		"I could not get going",
		"Nothing made me happy",
		"I felt like a bad person",
		"I lost interest in my usual activities",
		"I slept much more than usual",
		"I felt like I was moving too slowly",
		"I felt fidgety",
		"I wished I were dead",
		"I wanted to hurt myself",
		"I was tired all the time",
		"I did not like myself",
		"I lost a lot of weight without trying to",
		"I had a lot of trouble getting to sleep",
		"I could not focus on the important things",
	]
	
};

exports.diagnosisDep = function(questions){
	var total = 0;
	var countFour = 0;
	var countThree = 0;
	for(var i = 0; i < questions.length; i++){
		if(questions[i] == 4){
			countFour++;
		}
		if(questions[i] == 3){
			countThree++;
		}
		total += questions[i];
	}
	if((questions[7] == 4 && questions[9] == 4) || (questions[1] == 4 && questions[3] == 4 && questions[5] == 4)){
		if(countFour >= 4){
			return ["majorDep", total];
		}
		else if(countFour + countThree >= 3){
			return ["ProbableMajorDepressiveEpisode", total];
		}
		else if(countFour + countThree >= 2){
			return ["PossibleMajorDepressiveEpisode", total];
		}
		else if(total > 16){
			return ["SubthreshholdDepressionSymptoms", total];
		}
		else{
			return ["NoClinicalSignificance", total];
		}
	}
	else if(total > 16){
		return ["SubthreshholdDepressionSymptoms", total];
	}
	else{
		return ["NoClinicalSignificance", total];
	}
};

exports.anxiety = {
	min: 0,
	max: 3,
	intro: "In this Generalized Anxiety Scale, I will be asking you 7 questions on how often" +
		" you have been bothered by the following problems over the past two weeks or so. Please" +
		" respond to these questions with a 0, 1, 2, or 3; 0 meaning not at all sure and 3 being" +
		" nearly every day. Lets begin",
	outro: "Your entry has been logged. This scale was built using the Generalized Anxiety Disorder" +
		" 7-item (GAD-7) scale. Please visit http://www.phqscreeners.com",
	help: "To answer these questions, please say a number between 0 and 3. 0 indicates not at all sure." +
		" 1 indicates several days. 2 indicates over half the days. And 3 indicates nearly every day." +
		" Lets resume.",
	checker: "diagnosisAnx",
	MildAnxiety: "Based on the scores you have provided; your possible Generalized Anxiety Disorder" +
		" category is Mild Anxiety",
	ModAnxiety: "Based on the scores you have provided, you qualify for a probable diagnosis of" +
		" GAD; your possible Generalized Anxiety Disorder category is Moderate Anxiety. confirm" +
		" by future evaluation.",
	SeverAnxiety: "Based on the scores you have provided, you qualify for a probable diagnosis of" +
		" GAD; your possible Generalized Anxiety Disorder category is Sever Anxiety. confirm by" +
		" future evaluation",
	NoSig: "Based on the scores you have provided; your possible Generalized Anxiety Disorder" +
		" category shows no clinical significance",
	questions: [
		" Feeling nervous, anxious, or on edge",
		" Not being able to stop or control worrying",
		" Worrying too much about different things ",
		" Trouble relaxing ",
		" Being so restless that it's hard to sit still",
		" Becoming easily annoyed or irritable",
		"  Feeling afraid as if something awful might happen ",
	],
	mquestions: [
		"If you responded with any problems, how difficult have these made it for you to" +
		" do your work, takecare of things at home, or get along with other people?" +
		" Respond with no or between 0 and 3. 0 being not at all difficult. 1 being somewhat difficult. 2 being very" +
		" difficult. 3 being extremely difficult. And No, for does not apply.",
	]
};

exports.diagnosisAnx = function(questions){
	var total = 0;
	for(var i = 0; i < questions.length; i++){
		total += questions[i];
	}
	if(total < 5){
		return ["NoSig", total];
	}
	else if(total >= 5 && total < 10){
		return ["MildAnxiety", total];
	}
	else if(total >= 10 && total < 15){
		return ["ModAnxiety", total];
	}
	else{
		return ["SeverAnxiety", total];
	}
};

exports.stress = {
	min: 0,
	max: 4,
	intro: "In this Perceived Stress Scale, I will be asking you 10 questions on how" +
		" often you may have felt or behaved over the past month or so. Please respond" +
		" to these questions with a 0, 1, 2, 3, or 4; 0 meaning never and 4 being very" +
		" often. Lets begin",
	outro: "Your entry has been logged. This scale was built using the Perceived Stress Scale." +
		" Please visit http://www.mindgarden.com for further information.",
	help: "To answer these questions, please say a number between 0 and 4. 0 indicates never." +
		" 1 indicates almost never. 2 indicates sometimes. 3 indicates fairly often." +
		" And 4 indicts very often. Lets resume.",
	checker: "diagnosisStr",
	LowStress: "Based on the scores you have provided; your possible percieved stress category shows low perceived stress.",
 	ModStress: "Based on the scores you have provided; your possible perceived stress category shows moderate perceived stress.",
	HighStress: "Based on the scores you have provided; your possible perceived stress category shows high perceived stress.",

	questions: [
		" In the last month, how often have you been upset because of something that happened unexpectedly?",
		" In the last month, how often have you felt that you were unable to control the important things in your life?",
		" In the last month, how often have you felt nervous and “stressed”?",
		" In the last month, how often have you felt doubtful about your ability to handle your personal problems? ",
		" In the last month, how often have you felt that things were not going your way?",
		" In the last month, how often have you found that you could not cope with all the things that you had to do?",
		" In the last month, how often have you been unable to control irritations in your life?",
		" In the last month, how often have you felt that you that you could not stay on top of things?", 
		" In the last month, how often have you been angered because of things that were outside of your control?",
		" In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?",
	]
};
exports.diagnosisStr = function(questions){
	
	var total = 0;
	for(var i = 0; i < questions.length; i++){
		total += questions[i];
	}
	if(total < 13){
		return ["LowStress", total];
	}
	else if(total >= 14 && total < 26){
		return ["ModStress", total];
	}
	else{
		return ["HighStress", total];
	}

};

exports.general = {
	min: 0,
	max: 5,
	intro: "In this Kessler Psychological Distress Scale, I will be asking you 10 questions" +
		" on the ways you may have felt or behaved over the past month or so. Please" +
		" respond to these questions with a 1, 2, 3, 4, or 5; 1 meaning never" +
		" and 5 being all of the time. Lets begin.",
	outro: "Your entry has been logged. This scale was built using the Kessler Psychological" +
		" Distress Scale (K10) from Kessler R. Professor of Health Care Policy, Harvard" +
		" Medical School, Boston, USA. Please visit http://www.statisticssolutions.com/kessler-psychological-distress-scale-k10 for further information",
	help: "To answer these questions, please say a number between 1 and 5. 1 indicates none of" +
		" the time. 2 indicates a little of the time. 3 indicates some of the time. 4" +
		" indicates most of the time. And 5 indicates all of the time. Lets resume.",
	LikelyWell: "Based on the scores you have provided; your Kessler Psychological Distress Scale result is likely to be well",
	LikelyMild: "Based on the scores you have provided; your Kessler Psychological Distress Scale result is likely to have a mild mental disorder",
	LikelyMod: "Based on the scores you have provided; your Kessler Psychological Distress Scale result is likely to have moderate mental disorder",
	LikelySever: "Based on the scores you have provided; your Kessler Psychological Distress Scale result is likely to have a severe mental disorder",
	questions: [
		" During the last 30 days, about how often did you feel tired for no good reason?",
		" During the last 30 days, about how often did you feel nervous?",
		" During the last 30 days, about how often did you feel so nervous that nothing could calm you down?",
		" During the last 30 days, about how often did you feel hopeless?",
		" During the last 30 days, about how often did you feel restless or fidgety?",
		" During the last 30 days, about how often did you feel so restless you could not sit still?",
		" During the last 30 days, about how often did you feel depressed?",
		" During the last 30 days, about how often did you feel that everything was an effort?",
		" During the last 30 days, about how often did you feel so sad that nothing could cheer you up?",
		" During the last 30 days, about how often did you feel worthless?",
		
	]
};

exports.diagnosisGen = function(questions){
	var total = 0;
	for(var i = 0; i < questions.length; i++){
		total += questions[i];
	}
	if(total < 20){
		return ["LikelyWell", total];
	}
	else if(total >= 20 && total < 25){
		return ["LikelyMild", total];
	}
	else if(total >= 25 && total < 30){
		return ["LikelyMod", total];
	}
	else{
		return ["LikelySever", total];
	}

};
