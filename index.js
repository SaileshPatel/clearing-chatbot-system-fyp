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
    var fulfilText = "";


    const client = new Client({
        connectionString: process.env.DATABASE_URL
        //ssl: true
    });
    
    client.connect();

    switch(intent){
        case 'Course Spaces':
            client.query('SELECT description FROM Courses WHERE course_name LIKE \'%' + course + '%\';', (err, res) => {
                if(err) throw err;
                fulfilText = JSON.stringify(res.rows);
                client.end();
                return result.json({
                    fulfillmentText: fulfilText,
                    source: 'getcourse'
                })
            });
            break;
        case 'Entry Requirements':
            client.query('SELECT entry_requirements FROM Courses WHERE course_name LIKE \'%' + course + '%\';', (err, res) => {
                if(err) throw err;
                fulfilText = JSON.stringify(res.rows[0]['entry_requirements']);
                client.end();
                return result.json({
                    fulfillmentText: fulfilText,
                    source: 'getcourse'
                })
            });
            break;
        case 'Tuition Fees':
            client.query('SELECT website FROM Courses WHERE course_name LIKE \'%' + course + '%\';', (err, res) => {
                if(err) throw err;
                fulfilText = JSON.stringify(res.rows[0]);
                client.end();
                return result.json({
                    fulfillmentText: fulfilText,
                    source: 'getcourse'
                })
            });
            break;
        default:
            fulfilText = "We're not sure what you're asking for unfortunately.\nTry asking about tuition fees or entry requirements for a specific course."
            return result.json({
                fulfillmentText: fulfilText,
                source: 'getcourse'
            })
    }
})