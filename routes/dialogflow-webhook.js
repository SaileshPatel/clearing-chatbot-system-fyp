const db = require("./../db");
var express = require("express");
var router = express.Router();


router.post('/', (req, res) => {
    const intent = req.body.queryResult.intent.displayName;
    const course = req.body.queryResult.parameters.Course || req.body.queryResult.outputContexts.parameters.Course;
    var queryString = "";
    var fulfilText = "";
    var session = req.body.session;
    var columnToQuery = "";

    switch(intent){
        case 'Course Description':
            queryString = "SELECT description FROM Courses WHERE course_name LIKE $1";
            columnToQuery = "description";
            break;
        case 'Course Spaces':
            queryString = "SELECT course_spaces FROM Courses WHERE course_name LIKE $1;";
            columnToQuery = "course_spaces";
            break;
        case 'Entry Requirements':
            queryString = "SELECT entry_requirements FROM Courses WHERE course_name LIKE $1;";
            columnToQuery = "entry_requirements"
            break;
        case 'Tuition Fees':
            queryString = "SELECT tuition_fees FROM Courses WHERE course_name LIKE $1;";
            columnToQuery = "tuition_fees"
            break;
        case 'Contact Details':
            queryString = "SELECT contact_details FROM Courses WHERE course_name LIKE $1;";
            columnToQuery = "contact_details";
            break;
        case 'Modules':
            queryString = "SELECT module_title FROM Modules WHERE ucas_code = (SELECT ucas_code FROM Courses WHERE course_name LIKE $1);";
            columnToQuery = "module_title";
            break;
        default:
            return res.json({
                fulfillmentText: "We could not find anything for " + course + " related to " + intent + ". Please try asking about tuition fees, entry requirements, spaces or a description of " + course + ".",
                outputContexts: [{
                    "name": session + "/contexts/course",
                    "lifespanCount": 5,
                    "parameters": {
                        "name": course,
                    }
                }],
                source: 'getcourse'
            })
    }

    db.query(queryString, ['%' + course + '%'])
        .then(response => {
            if(columnToQuery === "course_spaces"){
                var courseSpaces = response.rows[0]['course_spaces'];
                if(courseSpaces > 0){
                    fulfilText = JSON.stringify("There are " + courseSpaces + " spaces left on " + course + ".");
                } else {
                    fulfilText = JSON.stringify("There are no spaces left on " + course + ".");
                }
            } else if (columnToQuery === "module_title") {
                if(response.rows.length == 0){
                    fulfilText = "There are no modules associated with " + course + " currently.";
                } else if (response.rows.length == 1){
                    fulfilText = "You still study the following module: '" + response.rows[0]['module_title'] + "'.";
                } else {
                    let module_titles = response.rows.map(module => "'" + module.module_title + "'");
                    let module_list = module_titles.slice(0, module_titles.length - 1).join(", ") + ", and " + module_titles.slice(-1);
                    fulfilText = "You will study the following modules: " + module_list + ".";
                }
            } else {
                fulfilText = JSON.stringify(response.rows[0][columnToQuery]);
            }
            return res.json({
                fulfillmentText: fulfilText,
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
                fulfillmentText: "We were unable to find information about " + course +  ". Please querying about a course we have information about like Law, Computer Science, or English.",
                source: 'getcourse'
            })
        })
})


module.exports = router;