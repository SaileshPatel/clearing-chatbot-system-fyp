const db = require("./../db");
var express = require("express");
var router = express.Router();


router.get('/', (req, res) => {
    db.query("SELECT ucas_code, course_name, course_spaces FROM Courses ORDER BY course_name ASC;", [])
    .then(response => {
        res.render('add-space-manually', {title: "Allocate Space", courses: response.rows});
    })
    .catch(err => {
        res.render('add-space-manually', {title: "Allocate Space", fail_message: "There has been a problem with connecting to our database. Please try again later."});
    })
})

module.exports = router;