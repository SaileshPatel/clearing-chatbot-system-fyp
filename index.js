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
    const intent = req.body.queryResult.intent.displayName;
    const course = req.body.queryResult.parameters.Course;
    var fulfilText = "";

    switch(intent) {
        case "Course Spaces":
            switch(course) {
                case "Computer Science":
                    fulfilText = "There are no spacees left on Computer Science"
                    break;
                case "English":
                    fulfilText = "There are seven spaces left on English"
                    break;
                default:
                    fulfilText = "We could not find the course you queried about.\nPlease make sure you have spelt thee course name correctly."
            }
            break;
        case "Entry Requirements":
            switch(course) {
                case "Computer Science":
                    fulfilText = "You will need a BTEC in IT Practitioners"
                    break;
                case "English":
                    fulfilText = "The grades are A*A*A"
                    break;
                default:
                    fulfilText = "We could not find the entry requirements for this course.\nPlease make sure that you have spelt the course name correctly."
            }
            break;
        case "Tuition Fees":
            switch(course) {
                case "Computer Science":
                    fulfilText = "It will cost £9,000 per year for an International Student to study Computer Science"
                    break;
                case "English":
                    fulfilText = "It will cost £9,000 per year for an International Student to study English"
                    break;
                default:
                    fulfilText = "We could not find the tuition for this course.\nPlease make sure that you have spelt the course name correctly."
            }
            break;
        default:
            fulfilText = "We're not sure what you're asking for unfortunately.\nTry asking about tuition fees or entry requirements for a specific course."
    }

    return res.json({
        fulfillmentText: fulfilText,
        source: 'getcourse'
    })
})