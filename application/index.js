const db = require("./../db");

function applicationStage(stage, request){
    var context = request.body.queryResult.outputContexts[0];

    switch(stage){
        case 'Application - yes':
            var firstName = context.parameters['first-name'];
            var lastName = context.parameters['last-name'];

            if(firstName.length <= 0 || lastName.length <= 0){
                return {
                    valid: false
                }
            } else {

                return {
                    queryString: "INSERT INTO students (first_name, last_name, ucas_code) VALUES ($1, $2, (SELECT ucas_code FROM courses WHERE course_name LIKE $3)) RETURNING student_id;",
                    queryParams: [context.parameters['first-name'], context.parameters['last-name'], '%' + context.parameters.Course + '%'],
                    nextQuestionContext: "get-date-of-birth",
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
        if(appStageInfo['valid']){
            db.query(queryString, queryParams)
                .then(result => {
                    var id = result.rows[0]['student_id'];
                    resolve({
                        fulfillmentText: "You have successfully started your application.",
                        outputContexts: [{
                            "name": session + "/contexts/" + nextQuestionToAsk,
                            "lifespanCount": 1,
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
                        fulfillmentText: "There was an error and your application has not been started at this time. Please try again.",
                        outputContexts: [currentContext],
                        source: 'getcourse'
                    })
                })
        } else {
            reject({
                fulfillmentText: "Your first or last name is blank. Please enter a valid first or last name.",
                outputContexts: [currentContext],
                source: 'getcourse'
            })
        }
    })
}

module.exports = apply;