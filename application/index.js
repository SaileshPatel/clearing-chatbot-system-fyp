const db = require("./../db");

function applicationStage(stage, request){
    switch(stage){
        case 'Application - yes':
            return {
                queryString: "INSERT INTO students (first_name, last_name, ucas_code) VALUES ($1, $2, (SELECT ucas_code FROM courses WHERE course_name LIKE $3)) RETURNING student_id;",
                queryParams: [request.body.queryResult.outputContexts[0].parameters['first-name'], request.body.queryResult.outputContexts[0].parameters['last-name'], '%' + request.body.queryResult.outputContexts[0].parameters.Course + '%'],
                nextQuestionContext: "get-date-of-birth"
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
        db.query(queryString, queryParams)
            .then(result => {
                var id = result.rows[0]['student_id'];
                var fulfilText;
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
                reject({
                    fulfillmentText: "There was an error and your application has not been started at this time. Please try again.",
                    outputContexts: [currentContext],
                    source: 'getcourse'
                })
            })
    })
}

module.exports = apply;