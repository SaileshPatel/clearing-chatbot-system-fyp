const db = require("./../db");



var apply = function(request, intent, intentClassification) {
    var queryString = intentClassification['queryString'];
    var nextQuestionToAsk = intentClassification['nextQuestionContext'];

    var session = request.body.session;
    var Course = request.body.queryResult.outputContexts[0].parameters.Course;
    var currentContext = request.body.queryResult.outputContexts[0];
    var firstName = request.body.queryResult.outputContexts[0].parameters['first-name'];
    var lastName = request.body.queryResult.outputContexts[0].parameters['last-name'];

    return new Promise(function(resolve, reject){
        db.query(queryString, [firstName, lastName, '%' + Course + '%'])
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
                reject({
                    fulfillmentText: "There was an error and your application has not been started at this time. Please try again.",
                    outputContexts: [currentContext],
                    source: 'getcourse'
                })
            })
    })
}

module.exports = apply;