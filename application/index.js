const db = require("./../db");

function applicationStage(stage, request){
    var context = request.body.queryResult.outputContexts[0];

    switch(stage){
        case 'Application - yes':
            var firstName = context.parameters['first-name'];
            var lastName = context.parameters['last-name'];

            if(firstName.length <= 0 || lastName.length <= 0){
                return {
                    errorMessage: 'Your first or last name is blank. Please re-enter your first and last name.',
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
            var validAge = 18;
            var dateOfBirth = context.parameters['date-of-birth'];
            var student_id = context.parameters['student-no'];

            var birthday = new Date(dateOfBirth);
            var today = new Date();

            var invalidAgeObj = {
                errorMessage: 'Based on your age, you seem to be too young to apply for a place at Aston University. If you have made a mistake on entering your date of birth, please re-enter your date of birth.',
                valid: false
            }

            if(today.getFullYear() - birthday.getFullYear() < validAge){
                return invalidAgeObj;
            } else {
                if(today.getFullYear() - birthday.getFullYear() <= validAge && today.getMonth() < birthday.getMonth()){
                    return invalidAgeObj;
                } else {
                    if(today.getFullYear() - birthday.getFullYear() <= validAge && today.getMonth() <= birthday.getMonth() && today.getDate() < birthday.getDate()){
                        return invalidAgeObj;
                    }
                }

                return {
                    queryString: "UPDATE students SET date_of_birth = $1 WHERE student_id = $2;",
                    queryParams: [dateOfBirth, student_id],
                    nextQuestionContext: 'get-gender',
                    successMessage: "You have successfully provided your date of birth. Next, please enter your gender (Male, Female, Other)",
                    quickResponses: [{
                        quickReplies: {
                            title: "You have successfully provided your date of birth. What is your gender",
                            quickReplies: ["I am a Male", "I am a Female", "I identify as Other"]},
                            platform: "FACEBOOK"
                          }],
                    valid: true
                }
            }
        case 'Application - Gender - yes':
            var gender = context.parameters['gender'];
            var student_id = context.parameters['student-no'];

            if(gender === "Male" || gender === "Female" || gender === "Other"){
                return {
                    queryString: "UPDATE students SET gender = $1 WHERE student_id = $2;",
                    queryParams: [gender, student_id],
                    nextQuestionContext: 'get-email',
                    successMessage: "You have successfully provided your gender. Next, please enter your email address.",
                    valid: true
                }
            } else {
                return {
                    errorMessage: 'You did not enter a valid gender type (Male, Female or Other). Please re-enter your gender.',
                    valid: false
                }
            }
        case 'Application - Email - yes':
            var email = context.parameters['email'];
            var student_id = context.parameters['student-no'];

            // regex for email validation from (https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript)
            var emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            if(emailRegex.test(email)){
                return {
                    queryString: "UPDATE students SET email_address = $1 WHERE student_id = $2;",
                    queryParams: [email, student_id],
                    nextQuestionContext: 'get-mobile-number',
                    successMessage: "You have successfully provided your email. Next, please enter your mobile phone number.",
                    valid: true
                }
            } else {
                return {
                    errorMessage: 'You have not provided a valid email address. Please re-enter your email address.',
                    valid: false
                }
            }
        case 'Application - MobileNumber - yes':
            var mobileNumber = context.parameters['mobile-number.original'];
            var student_id = context.parameters['student-no'];
            if(mobileNumber.length > 0){
                return {
                    queryString: "UPDATE students SET mobile_number = $1 WHERE student_id = $2;",
                    queryParams: [mobileNumber, student_id],
                    nextQuestionContext: 'get-previously-applied',
                    successMessage: "You have successfully provided your mobile number. Next, have you ever applied to Aston previously?",
                    valid: true
                }
            } else {
                return {
                    errorMessage: 'You have not provided a valid mobile number. Please re-enter your mobile number.',
                    valid: false

                }
            }
        case 'Application - PreviouslyApplied - yes':
            var hasPreviouslyApplied = (context.parameters['previously-applied'] == 'True');
            console.log(hasPreviouslyApplied);
            var student_id = context.parameters['student-no'];
            return {
                queryString: "UPDATE students SET previously_applied = $1 WHERE student_id = $2;",
                queryParams: [hasPreviouslyApplied, student_id],
                nextQuestionContext: hasPreviouslyApplied ? 'get-application-status' : 'get-ucas-status',
                successMessage: hasPreviouslyApplied ? "Thank you for confirming that you have previously applied. What was the outcome of your application?" : "Thank you for confirming that you have not previously applied. Next, what is your UCAS status?",
                quickResponses: hasPreviouslyApplied ? [{
                    quickReplies: {
                        title: "Thank you for confirming that you have previously applied. What was the outcome of your application?",
                        quickReplies: ["I declined an unconditional offer", "I declined a conditional offer", "I was rejected", "I accepted a conditional offer as an insurance option", "I accepted a unconditional offer as an insurance option", "I was made an offer, but did not recieve the sufficient grades"]},
                        platform: "FACEBOOK"
                      }] : 
                      [{
                        quickReplies: {
                          title: "Thank you for confirming that you have not previously applied. Next, what is your UCAS status?",
                          quickReplies: ["In clearing","Firm offer elsewhere","Registered for Adjustment", "Not applied to UCAS"]
                        },
                        platform: "FACEBOOK"
                      }] ,
                valid: true
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
    var quickResponses = appStageInfo['quickResponses'];

    var session = request.body.session;
    var currentContext = request.body.queryResult.outputContexts[0];
    currentContext['lifespanCount'] = 1;

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
                            "lifespanCount": 2,
                            "parameters": {
                                "student_id": id,
                            }
                        }],
                        fulfillmentMessages: quickResponses,
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