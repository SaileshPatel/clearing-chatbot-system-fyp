const express = require("express");
require("dotenv").config();

const db = require("./db");
const dialogflow_webhook = require("./routes/dialogflow-webhook.js");
const manual_space_allocation = require("./routes/allocate-space-manually.js");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'pug')

app.listen(port, () =>{
    console.log(`Server is running at http://localhost:${port}`)
})

app.get("/", (req, res) => {
    res.render('index', {title: "Home"});
})

app.get("/add-course-programme", (req, res) =>{
    res.render('add-course-programme', {title: "Add Course Programme"});
})

app.get("/add-multiple-course-programmes", (req, res) =>{
    res.render('add-multiple-course-programmes', {title: "Add Multiple Course Programmes"});
})

app.post("/allocate-a-space", (req, res) =>{
    var course_to_update = req['body']['ucas_code'];
    db.query("UPDATE Courses SET course_spaces = course_spaces - 1 WHERE ucas_code = $1 AND course_spaces > 0;", [course_to_update])
        .then(response => {
            db.query("SELECT ucas_code, course_name, course_spaces FROM Courses ORDER BY course_name ASC;", [])
                .then(response => {
                    res.render('add-space-manually', {title: "Allocate Space", courses: response.rows});
                })
                .catch(err => {
                    res.render('add-space-manually', {title: "Allocate Space", fail_message: "There has been a problem with retrieving the list of courses. Please try again later."});
                })
            //res.render("index", {title: "Success"});
        })
        .catch(err => {
            res.render('add-space-manually', {title: "Allocate Space", fail_message: "There has been an issue with adding a space to the course at this time."});
        })
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

app.use("/allocate-space", manual_space_allocation);

app.use("/getcourse", dialogflow_webhook);