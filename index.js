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
    return res.json({
        fulfillmentText: "Your requirements are A*A*A*",
        source: 'getentryrequirements'
    })
})