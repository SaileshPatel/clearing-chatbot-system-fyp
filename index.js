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
            res.render('add-course-programme', {title: 'Add Course Programme', message: "There was an error. Please contact an administrator."});
        })
})


function isUndergrad(course_type){
    switch(course_type) {
        case 'BA':
        case 'BSc':
        case 'BENG':
        case 'LLB':
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
    const course = req.body.queryResult.parameters.Course;
    const queryParams = ['%' + course + '%'];
    var fulfilText = "";

    switch(intent){
        case 'Course Spaces':
            var queryString = "SELECT course_spaces FROM Courses WHERE course_name LIKE $1;";
            db.query(queryString, queryParams)
                .then(response => {
                    fulfilText = "";
                    spaces = response.rows[0]['course_spaces'];
                    if(spaces > 0){
                        fulfilText = JSON.stringify("There are " + spaces + " left on " + course + ".");
                    } else {
                        fulfilText = JSON.stringify("There are no spaces left on " + course + ".");
                    }
                    return res.json({
                        fulfillmentText: fulfilText,
                        source: 'getcourse'
                    })   
                }).catch(err => {
                    console.error(err.stack);
                    return res.json({
                        fulfillmentText: "We are unable to get the information you require.\n Please try again later.",
                        source: 'getcourse'
                    })
                })
            break;
        case 'Entry Requirements':
            var queryString = "SELECT entry_requirements FROM Courses WHERE course_name LIKE $1;";
            db.query(queryString, queryParams)
                .then(response => {
                    fulfilText = JSON.stringify(response.rows[0]['entry_requirements']);
                    return res.json({
                        fulfillmentText: fulfilText,
                        source: 'getcourse'
                    })
                }).catch(err => {
                    console.error(err.stack);
                    return res.json({
                        fulfillmentText: "We are unable to get the information you require.\n Please try again later.",
                        source: 'getcourse'    
                    })
                })
            break;
        case 'Tuition Fees':
            var queryString = "SELECT tuition_fees FROM Courses WHERE course_name LIKE $1;";
            db.query(queryString, queryParams)
                .then(response => {
                    fulfilText = JSON.stringify(response.rows[0]['tuition_fees']);
                    return res.json({
                        fulfillmentText: fulfilText,
                        source: 'getcourse'
                    })
                }).catch(err => {
                    console.error(err.stack);
                    return res.json({
                        fulfillmentText: "We are unable to get the information you require.\n Please try again later.",
                        source: 'getcourse'
                    })
                })
            break;
        default:
            fulfilText = "We're not sure what you're asking for unfortunately.\nTry asking about tuition fees or entry requirements for a specific course."
            return res.json({
                fulfillmentText: fulfilText,
                source: 'getcourse'
            })
    }
})