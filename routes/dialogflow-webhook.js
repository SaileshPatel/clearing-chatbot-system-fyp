const db = require("./../db");
var express = require("express");
var router = express.Router();

router.post('/', (req, res) => {
    const intent = req.body.queryResult.intent.displayName;
    const course = req.body.queryResult.parameters.Course || req.body.queryResult.outputContexts.parameters.Course;
    var session = req.body.session;

    if(intentClassifier(intent)['status'] && intentClassifier(intent)['type'] === 'query'){
        var queryString = intentClassifier(intent)['queryString'];
        var columnToQuery = intentClassifier(intent)['columnToQuery'];

        db.query(queryString, ['%' + course + '%'])
            .then(response => {
                var message = fulfillmentText(course, columnToQuery, response); 
                return res.json({
                    fulfillmentText: message,
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
    } else if (intentClassifier(intent)['status'] && intentClassifier(intent)['type'] === 'generic') {
        var queryString = intentClassifier(intent)['queryString'];
        var columnToQuery = intentClassifier(intent)['columnToQuery'];

        db.query(queryString, [])
            .then(response => {
                var fulfillmentText;
                if(response.rows.length == 0){
                    fulfillmentText =  "You can find out about many modules.";
                } else if (response.rows.length == 1){
                    fulfillmentText =  "You can find out about the following course: '" + response.rows[0]['module_title'] + "'.";
                } else {
                    let course_titles = response.rows.map(course => "'" + course['course_name'] + "'");
                    let course_list = course_titles.slice(0, course_titles.length - 1).join(", ") + ", and " + course_titles.slice(-1);
                    fulfillmentText = "We can provide information on the following courses: " + course_list + ".";
                }

                return res.json({
                    fulfillmentText: "Hello. Welcome to Aston's clearing admissions chatbot. How can we help you today? We can answer questions about course spaces, descriptions, entry requirements, contact details and what modules you'll study on our courses. ".concat(fulfillmentText),
                    source: 'getcourse'
                })
            })
            .catch(err => {
                return res.json({
                    fulfillmentText: "We were unable to find information. Please querying about a course we have information about like Law, Computer Science, or English.",
                    source: 'getcourse'
                })
            })
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
                return JSON.stringify("There are " + courseSpaces + " spaces left on " + course + ".");
            } else {
                return JSON.stringify("There are no spaces left on " + course + ".");
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
        default:
            return JSON.stringify(response.rows[0][columnToQuery]);
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
                    type: 'generic'
                }
        default:
            return {
                status: false,
                type: 'query'
            }
    }
}

module.exports = router;