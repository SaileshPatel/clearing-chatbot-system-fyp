const express = require("express");
const http = require("http");
const { Pool } = require('pg');
const pug = require("pug");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'pug')

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

app.get("/", (req, res) => {
    res.render('index', {title: "Home"});
})

app.get("/single-upload", (req, res) =>{
    res.render('add-course-programme', {title: "Add Course Programme"});
})

app.get("/batch-upload", (req, res) =>{
    res.render('add-course-programes', {title: "Add Multiple Course Programmes"});
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
        req['body']['course_type']
    ] // course_spaces

    var queryString = "INSERT INTO Courses(ucas_code, description, contact_details, entry_requirements, website, course_name, tuition_fees, course_spaces, course_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);";

    pool.connect()
        .then(client => {
            return client
                .query(queryString, queryParams)
                .then(response => {
                    client.release();
                    console.log(response);
                    console.log(response.rows);
                    res.render('add-course-programme', {title: 'Add Course Programme', message: "Your course was successfully added to the database."});
                })
                .catch(err => {
                    client.release();
                    console.error(err.stack);
                    res.render('add-course-programme', {title: 'Add Course Programme', message: "There was an error. Please contact an administrator."})
                })

        }).catch(err => {
            console.error(err.stack);
            res.render('add-course-programme', {title: 'Add Course Programme', message: "There was an error. Please contact an administrator."});
        })
})

app.post('/getcourse', (req, res) => {
    var result = res; 

    const intent = req.body.queryResult.intent.displayName;
    const course = req.body.queryResult.parameters.Course;
    const queryParams = ['%' + course + '%'];
    var fulfilText = "";

    switch(intent){
        case 'Course Spaces':
            var queryString = "SELECT course_spaces FROM Courses WHERE course_name LIKE $1;";
            pool.connect()
                .then(client => {
                    return client
                        .query(queryString, queryParams)
                        .then(res => {
                            fulfilText = "";
                            spaces = res.rows[0]['course_spaces'];
                            client.release();
                            if(spaces > 0){
                                fulfilText = JSON.stringify("There are " + spaces + " left on " + course + ".");
                            } else {
                                fulfilText = JSON.stringify("There are no spaces left on " + course + ".");
                            }
                            return result.json({
                                fulfillmentText: fulfilText,
                                source: 'getcourse'
                            })        
                        })
                        .catch(err => {
                            client.release();
                            console.error(err);
                        })
                })
                .catch(err => {
                    console.error(err);
                })
            break;
        case 'Entry Requirements':
            var queryString = "SELECT entry_requirements FROM Courses WHERE course_name LIKE $1;";
            pool.connect()
                .then(client => {
                    return client
                        .query(queryString, queryParams)
                        .then(res => {
                            fulfilText = JSON.stringify(res.rows[0]['entry_requirements']);
                            client.release();
                            return result.json({
                                fulfillmentText: fulfilText,
                                source: 'getcourse'
                            })
                        })
                        .catch(err => {
                            client.release();
                            console.error(err);
                        })
                })
                .catch(err => {
                    console.error(err);
                })
            break;
        case 'Tuition Fees':
            var queryString = "SELECT tuition_fees FROM Courses WHERE course_name LIKE $1;";
            pool.connect()
                .then(client => {
                    return client
                        .query(queryString, queryParams)
                        .then(res => {
                            fulfilText = JSON.stringify(res.rows[0]['tuition_fees']);
                            client.release();
                            return result.json({
                                fulfillmentText: fulfilText,
                                source: 'getcourse'
                            })
                        })
                        .catch(err => {
                            client.release();
                            console.error(err);
                        })

                })
                .catch(err => {
                    console.error(err);
                })
            break;
        default:
            fulfilText = "We're not sure what you're asking for unfortunately.\nTry asking about tuition fees or entry requirements for a specific course."
            return result.json({
                fulfillmentText: fulfilText,
                source: 'getcourse'
            })
    }
})