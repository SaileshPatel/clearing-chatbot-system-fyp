const express = require("express");
require("dotenv").config();

const db = require("./db");
const dialogflow_webhook = require("./routes/dialogflow-webhook.js");
const manual_space_allocation = require("./routes/allocate-space-manually.js");
const upload_single_course = require("./routes/upload-single-course.js");

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

app.use("/add-course-programme", upload_single_course);

app.use("/allocate-space", manual_space_allocation);

app.use("/getcourse", dialogflow_webhook);
