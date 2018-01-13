function depression(){
	return {
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
		goal: "lower",
		MajorDepressiveEpisode: " Based on the scores you have provided; your possible depressive symptom category is Major Depressive Episode.”,
		ProbableMajorDepressiveEpisode: " Based on the scores you have provided; your possible depressive symptom category is Probable Major Depressive Episode.”,
		PossibleMajorDepressiveEpisode: " Based on the scores you have provided; your possible depressive symptom category is Possible major depressive episode.”,
		SubthreshholdDepressionSymptoms: " Based on the scores you have provided; your possible depressive symptom category is Subthreshhold depression symptoms.”,
		NoClinicalSignificance: " Based on the scores you have provided; your possible depressive symptom category shows no clinical significance.”,
		questions: [ 
			"My appetite was poor",
			"I could not shake off the blues",
			"I had trouble keeping my mind on what I was doing",
			"I felt depressed",
			"My sleep was restless",
			"I felt sad",
			"My sleep was restless",
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
		
	}
}
function diagnosisDep(questions){
	if(questions[7] == 4 && questions[9] == 4){
		var countFour = 0;
		var countThree = 0;
		for(var i = 0; i < questions.length; i++){
			if(i == 7 || i == 9){
				continue;
			}
			if(questions[i] == 4){
				countFour++;
			}
			else if(){
			}
		}
	}
	else if(questions[1] == 4 && questions[3] == 4 && questions[5] == 4){
		
	}
	else{
	
	}
}
