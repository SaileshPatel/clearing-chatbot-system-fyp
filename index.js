const express = require("express");
const http = require("http");
const { Client } = require('pg');
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.status(200).send('Server is working');
})

app.listen(port, () =>{
    console.log(`Server is running at http://localhost:${port}`)
})

app.post('/getcourse', (req, res) => {
    var result = res; 

    const intent = req.body.queryResult.intent.displayName;
    const course = req.body.queryResult.parameters.Course;
    const queryParams = ['%' + course + '%'];
    var fulfilText = "";


    const client = new Client({
        connectionString: process.env.DATABASE_URL
        //ssl: true
    });
    
    client.connect();

    switch(intent){
        case 'Course Spaces':
            var queryString = "SELECT course_spaces FROM Courses WHERE course_name LIKE $1;";
            client.query(queryString, queryParams)
                .then(res => {
                    fulfilText = JSON.stringify(res.rows);
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
        case 'Entry Requirements':
            var queryString = "SELECT entry_requirements FROM Courses WHERE course_name LIKE $1;";
            client.query(queryString, queryParams)
                .then(res => {
                    fulfilText = JSON.stringify(res.rows);
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
                    fulfilText = JSON.stringify(res.rows);
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