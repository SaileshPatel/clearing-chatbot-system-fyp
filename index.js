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

app.post('/getentryrequirements', (req, res) => {
    const course = req.body.queryResult && req.body.queryResult.parameters && req.body.queryResult.parameters.course ? req.body.result.parameters.course : ''

    const fulfilText = "";
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
        source: 'getentryrequirements'
    })
})