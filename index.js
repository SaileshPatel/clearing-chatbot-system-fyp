const express = require("express");
const http = require("http");
const { Client } = require('pg');
const pug = require("pug");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'pug')

const client = new Client({
    connectionString: process.env.DATABASE_URL
})

app.get("/", (req, res) => {
    res.render('index', {title: "Home"});
})

app.get("/single-upload", (req, res) =>{
    res.render('single-upload', {title: "Single Upload"});
})

app.get("/batch-upload", (req, res) =>{
    res.render('batch-upload', {title: "Batch Upload"});
})

app.listen(port, () =>{
    console.log(`Server is running at http://localhost:${port}`)
})

app.post('/upload-one-record', (req, res) => {
    var data_to_upload = [req['body']['ucas_code'], 
        req['body']['course_description'], 
        req['body']['contact_details'], 
        req['body']['entry_requirements'], 
        req['body']['course_website'], 
        req['body']['course_name'], 
        req['body']['tuition_fees'],
        0] // course_spaces

    client.connect();

    var queryString = "INSERT INTO Courses(ucas_code, description, contact_details, entry_requirements, website, course_name, tuition_fees, course_spaces) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);";

    client.query(queryString, data_to_upload)
        .then(response =>{
            console.log(response);
            client.end();
        })
        .catch(err => {
            console.log(err.stack);
            client.end();
        })

    //console.log(req.body);
    //res.render('single-upload', {title: 'Single Upload'});
})

app.post('/getcourse', (req, res) => {
    var result = res; 

    const intent = req.body.queryResult.intent.displayName;
    const course = req.body.queryResult.parameters.Course;
    const queryParams = ['%' + course + '%'];
    var fulfilText = "";
    
    client.connect();

    switch(intent){
        case 'Course Spaces':
            var queryString = "SELECT course_spaces FROM Courses WHERE course_name LIKE $1;";
            client.query(queryString, queryParams)
                .then(res => {
                    fulfilText = "";
                    spaces = res.rows[0]['course_spaces'];
                    client.end();
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
                    console.log(err);
                })
            break;
        case 'Entry Requirements':
            var queryString = "SELECT entry_requirements FROM Courses WHERE course_name LIKE $1;";
            client.query(queryString, queryParams)
                .then(res => {
                    fulfilText = JSON.stringify(res.rows[0]['entry_requirements']);
                    client.end();
                    return result.json({
                        fulfillmentText: fulfilText,
                        source: 'getcourse'
                    })
                })
                .catch(err => {
                    console.log(err);
                })
            break;
        case 'Tuition Fees':
            var queryString = "SELECT tuition_fees FROM Courses WHERE course_name LIKE $1;";
            client.query(queryString, queryParams)
                .then(res => {
                    fulfilText = JSON.stringify(res.rows[0]['tuition_fees']);
                    client.end();
                    return result.json({
                        fulfillmentText: fulfilText,
                        source: 'getcourse'
                    })
                })
                .catch(err => {
                    console.log(err);
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