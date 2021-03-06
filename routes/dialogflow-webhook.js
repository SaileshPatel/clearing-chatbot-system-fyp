const db = require("./../db");
var express = require("express");
var router = express.Router();

var application = require("./../application");

router.post('/', (req, res) => {
    const intent = req.body.queryResult.intent.displayName;
    var session = req.body.session;

    if(intentClassifier(intent)['status'] && intentClassifier(intent)['type'] === 'query'){
        const course = req.body.queryResult.parameters.Course;
        var queryString = intentClassifier(intent)['queryString'];
        var columnToQuery = intentClassifier(intent)['columnToQuery'];

        // use ternary operator to filter between Default Welcome Intent (no param) and other
        db.query(queryString, 'Course' in req.body.queryResult.parameters ? ['%' + course + '%' ] : [])
            .then(response => {
                var message = fulfillmentText(course, columnToQuery, response); 
                return res.json({
                    fulfillmentText: message.replace(/\n|\r/g, ' '),
                    outputContexts: [{
                        "name": session + "/contexts/course",
                        "lifespanCount": 5,
                        "parameters": {
                            "name": course,
                        }
                    }],
                    source: 'getcourse'
                })
            }).catch(err => {
                console.error(err.stack);
                return res.json({
                    fulfillmentText: "We were unable to find information about " + course +  ". Please querying about another course.",
                    source: 'getcourse'
                })
            })
    } else if (intentClassifier(intent)['status'] && intentClassifier(intent)['type'] === 'insert') {
        var applicationRes = application(req, intent);


        if(intent == "Application - yes"){
            var course = req.body.queryResult.outputContexts[0].parameters.Course;
        
            db.query("SELECT course_spaces FROM Courses WHERE course_name LIKE $1", [course])
                .then(response => {
                    var spaces = response.rows[0]['course_spaces'];
                    if(spaces <= 0){
                        return res.json({
                            fulfillmentText: "We're sorry, but the course " + course + " does not have any spaces. Type 'Hello' to go back to the start of this conversation.",
                            source: 'getcourse'
                        })
                    } else {
                        applicationRes
                            .then(result => {
                                return res.json(result);
                            })
                            .catch(err => {
                                return res.json(err);
                            })
                    }
                })
                .catch(err => {
                    console.log(err);
                    return res.json({
                        fulfillmentText: "There has been an error with your application. Please try again later",
                        source: 'getcourse'
                    })
                })
        } else {
            applicationRes
                .then(result => {
                    return res.json(result);
                })
                .catch(err => {
                    return res.json(err);
                })  
        }

        // applicationRes
        //     .then(result => {
        //         return res.json(result);
        //     })
        //     .catch(err => {
        //         return res.json(err);
        //     })
    
    } else {
        return res.json({
            fulfillmentText: "Unfortunately, we were unable to find information related to '" + intent + "'. Try querying about spaces, descriptions, entry requirements, tuition fees, contact details and modules for our courses.",
            source: 'getcourse'
        })
    }
})


function fulfillmentText(course, columnToQuery, response){
    switch(columnToQuery){
        case 'course_spaces':
            var courseSpaces = response.rows[0]['course_spaces'];
            if(courseSpaces > 0){
                return "There are " + courseSpaces + " spaces left on " + course + ".";
            } else {
                return "There are no spaces left on " + course + ".";
            }
        case 'module_title':
            if(response.rows.length == 0){
                return "There are no modules associated with " + course + " currently.";
            } else if (response.rows.length == 1){
                return "You still study the following module: '" + response.rows[0]['module_title'] + "'.";
            } else {
                let module_titles = response.rows.map(module => "'" + module.module_title + "'");
                let module_list = module_titles.slice(0, module_titles.length - 1).join(", ") + ", and " + module_titles.slice(-1);
                return "You will study the following modules: " + module_list + ".";
            }
        case 'course_name':
            var fulfillmentText;
            if(response.rows.length == 0){
                fulfillmentText =  "";
            } else if (response.rows.length == 1){
                fulfillmentText =  "We can provide information about the following course: '" + response.rows[0]['course_name'] + "'.";
            } else {
                let course_titles = response.rows.map(course => "'" + course['course_name'] + "'");
                let course_list = course_titles.slice(0, course_titles.length - 1).join(", ") + ", and " + course_titles.slice(-1);
                fulfillmentText = "We can provide information on the following courses: " + course_list + ".";
            }
            return "Hello. Welcome to Aston's clearing admissions chatbot. How can we help you today? We can answer questions about course spaces, descriptions, entry requirements, contact details and what modules you'll study on our courses. ".concat(fulfillmentText);
        default:
            return response.rows[0][columnToQuery];
    }
}


function intentClassifier(intent){
    switch(intent){
        case 'Course Description':
            return {
                queryString: "SELECT description FROM Courses WHERE course_name LIKE $1",
                columnToQuery: "description",
                status: true,
                type: 'query'
            }
        case 'Course Spaces':
            return {
                queryString: "SELECT course_spaces FROM Courses WHERE course_name LIKE $1;",
                columnToQuery: "course_spaces",
                status: true,
                type: 'query'
            }
        case 'Entry Requirements':
            return {
                queryString: "SELECT entry_requirements FROM Courses WHERE course_name LIKE $1;",
                columnToQuery: "entry_requirements",
                status: true,
                type: 'query'
            }
        case 'Tuition Fees':
            return {
                queryString: "SELECT tuition_fees FROM Courses WHERE course_name LIKE $1;",
                columnToQuery: "tuition_fees",
                status: true,
                type: 'query'
            }
            case 'Contact Details':
                return {
                    queryString: "SELECT contact_details FROM Courses WHERE course_name LIKE $1;",
                    columnToQuery: "contact_details",
                    status: true,
                    type: 'query'
                }
            case 'Modules':
                return {
                    queryString: "SELECT module_title FROM Modules WHERE ucas_code = (SELECT ucas_code FROM Courses WHERE course_name LIKE $1);",
                    columnToQuery: "module_title",
                    status: true,
                    type: 'query'
                }
            case 'Default Welcome Intent':
                return {
                    queryString: "SELECT course_name FROM Courses;",
                    columnToQuery: "course_name",
                    status: true,
                    type: 'query'
                }
            case 'Application - yes':
                return {
                    status: true,
                    type: 'insert'
                }
            case 'Application - DoB - yes':
                return {
                    status: true,
                    type: 'insert'
                }
            case 'Application - Gender - yes':
                return {
                    status: true,
                    type: 'insert'
                }
            case 'Application - Email - yes':
                return {
                    status: true,
                    type: 'insert'
                }
            case 'Application - MobileNumber - yes':
                return {
                    status: true,
                    type: 'insert'
                }
            case 'Application - PreviouslyApplied - yes':
                return {
                    status: true,
                    type: 'insert'
                }
            case 'Application - PreviousApplicationStatus - yes':
                return {
                    status: true,
                    type: 'insert'
                }
            case 'Application - UCAS-Status - yes':
                return {
                    status: true,
                    type: 'insert'
                }
            case 'Application - UCAS-Number - yes':
                return {
                    status: true,
                    type: 'insert'
                }
            case 'Application - Nationality - yes':
                return {
                    status: true,
                    type: 'insert'
                }
            case 'Application - OnBehalfAgent - yes':
                return {
                    status: true,
                    type: 'insert'
                }
            case 'Application - GetAgent - yes':
                return {
                    status: true,
                    type: 'insert'
                }
            case 'Application - GetAgentHelp - yes':
                return {
                    status: true,
                    type: 'insert'
                }
            case 'Application - GetAgentEmail - yes':
                return {
                    status: true,
                    type: 'insert'
                }
            case 'Application - FiveGCSES - yes':
                return {
                    status: true,
                    type: 'insert'
                }
        default:
            return {
                status: false
            }
    }
}

module.exports = router;