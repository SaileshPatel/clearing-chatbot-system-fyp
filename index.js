const express = require("express");
require("dotenv").config();

const db = require("./db");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'pug')

app.get("/", (req, res) => {
    res.render('index', {title: "Home"});
})

app.get("/add-course-programme", (req, res) =>{
    res.render('add-course-programme', {title: "Add Course Programme"});
})

app.get("/add-multiple-course-programmes", (req, res) =>{
    res.render('add-multiple-course-programmes', {title: "Add Multiple Course Programmes"});
})

app.listen(port, () =>{
    console.log(`Server is running at http://localhost:${port}`)
})

app.post('/upload-one-record', (req, res) => {
    var queryParams = [req['body']['ucas_code'],
        req['body']['course_description'], 
        req['body']['contact_details'], 
        req['body']['entry_requirements'], 
        req['body']['course_website'], 
        req['body']['course_name'], 
        req['body']['tuition_fees'],
        req['body']['course_spaces'],
        req['body']['course_type'],
        isUndergrad(req['body']['course_type'])
    ]

    var queryString = "INSERT INTO Courses(ucas_code, description, contact_details, entry_requirements, website, course_name, tuition_fees, course_spaces, course_type, undergraduate_or_postgraduate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);";

    db.query(queryString, queryParams)
        .then(response => {
            res.render('add-course-programme', {title: 'Add Course Programme', message: "Your course was successfully added to the database."});
        })
        .catch(err => {
            var error_message;
            // error codes for PostgreSQL can be found here: https://www.postgresql.org/docs/current/errcodes-appendix.html
            if(err.code === '23505') {
                error_message = "This UCAS Code has already been used. Please use a different UCAS code for the course you wish to submit.";
            } else {
                error_message = "There was an error. Please contact an administrator."
            }
            res.render('add-course-programme', {title: 'Add Course Programme', message: error_message});
        })
})

// list obtained from https://www.aber.ac.uk/en/undergrad/before-you-apply/ba-bsc-ma-msc-phd/
function isUndergrad(course_type){
    switch(course_type) {
        // Bachelor Degrees
        case 'BA':
        case 'BSc':
        case 'BENG':
        case 'LLB':
        // Integrated Masters Degrees
        case 'MARTS':
        case 'MBIOL':
        case 'MCOMP':
        case 'MENG':
        case 'MMATH':
        case 'MPHYS':
        case 'MSCI':
            return "Undergraduate";
        case 'MA':
        case 'MSc':
        case 'MBA':
        case 'MPhil':
        case 'MRes':
        case 'LLM':
        case 'PhD':
            return 'Postgraduate';
    }
}

app.post('/getcourse', (req, res) => {
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
        default:
            fulfilText = "We're not sure what you're asking for unfortunately.\nTry asking about tuition fees or entry requirements for a specific course."
            return res.json({
                fulfillmentText: fulfilText,
                source: 'getcourse'
            })
    }

    var queryParams = ['%' + course + '%'];

    db.query(queryString, queryParams)
        .then(response => {
            fulfilText = JSON.stringify(response.rows[0][columnToQuery]);
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
                fulfillmentText: "We are unable to get the information you require.\n Please try again later.",
                source: 'getcourse'
            })
        })



})