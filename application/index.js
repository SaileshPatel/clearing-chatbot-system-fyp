const db = require("./../db");

function applicationStage(stage, request){
    var context = request.body.queryResult.outputContexts[0];

    switch(stage){
        case 'Application - yes':
            var firstName = context.parameters['first-name'];
            var lastName = context.parameters['last-name'];

            if(firstName.length <= 0 || lastName.length <= 0){
                return {
                    errorMessage: 'Your first or last name is blank. Please enter a valid first or last name.',
                    valid: false,
                }
            } else {
                return {
                    queryString: "INSERT INTO students (first_name, last_name, ucas_code) VALUES ($1, $2, (SELECT ucas_code FROM courses WHERE course_name LIKE $3)) RETURNING student_id;",
                    queryParams: [firstName, lastName, '%' + context.parameters.Course + '%'],
                    nextQuestionContext: "get-date-of-birth",
                    successMessage: "You have successfully started your application. Next, enter your date of birth.",
                    valid: true
                }
            }
        case 'Application - DoB - yes':
            var dateOfBirth = context.parameters['date-of-birth'];
            var student_id = context.parameters['student-no'];
            if(dateOfBirth < 0){
                return {
                    errorMessage: 'You seem to be too young to apply for a place at Aston University',
                    valid: false
                }
            } else {
                return {
                    queryString: "UPDATE students SET date_of_birth = $1 WHERE student_id = $2;",
                    queryParams: [dateOfBirth, student_id],
                    nextQuestionContext: 'get-gender',
                    successMessage: "You have successfully provided your date of birth. Next, please enter your gender (Male, Female, Other)",
                    valid: true
                }
            }
        default:
            return {

            }
    }
}

var apply = function(request, intent) {
    var appStageInfo = applicationStage(intent, request);
    var queryString = appStageInfo['queryString'];
    var queryParams = appStageInfo['queryParams'];
    var nextQuestionToAsk = appStageInfo['nextQuestionContext'];

    var session = request.body.session;
    var currentContext = request.body.queryResult.outputContexts[0];

    return new Promise(function(resolve, reject){
        var genericErrorMessage = "There was an error and your application has not been started at this time. Please try again.";

        if(appStageInfo['valid']){
            db.query(queryString, queryParams)
                .then(result => {
                    var id = intent === 'Application - yes' ? result.rows[0]['student_id'] : request.body.queryResult.outputContexts[0].parameters['student-no'];
                    resolve({
                        fulfillmentText: appStageInfo['successMessage'],
                        outputContexts: [{
                            "name": session + "/contexts/" + nextQuestionToAsk,
                            "lifespanCount": 5,
                            "parameters": {
                                "student_id": id,
                            }
                        }],
                        source: 'getcourse'                    
                    })
                })
                .catch(err => {
                    console.log(err);
                    reject({
                        fulfillmentText: genericErrorMessage,
                        outputContexts: [currentContext],
                        source: 'getcourse'
                    })
                })
        } else {
            reject({
                fulfillmentText: appStageInfo['errorMessage'],
                outputContexts: [currentContext],
                source: 'getcourse'
            })
        }
    })
}

module.exports = apply;