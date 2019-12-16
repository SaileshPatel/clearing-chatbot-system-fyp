const express = require("express");
const http = require("http");
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
    const intent = req.body.intent.displayName;
    const course = req.body.queryResult.parameters.Course;
    var fulfilText = "";
    var intentText = "";

    switch(intent) {
        case "Course Spaces":
            // find the no of course spaces left for this course
            break;
        case "Entry Requirements":
            // find the entry requirements for this course 
            break;
        case "Tuition Fees":
            // find the tuition fee for this course
            break;
        default:
            // something about not being clear about what is going on....
    }

    switch(course) {
        case "Computer Science":
            fulfilText = "You will need a BTEC in IT Practitioners"
            break;
        case "English":
            fulfilText = "The grades are A*A*A"
            break;
        default:
            fulfilText = "This course could not be found"
    }

    return res.json({
        fulfillmentText: fulfilText,
        source: 'getcourse'
    })
})