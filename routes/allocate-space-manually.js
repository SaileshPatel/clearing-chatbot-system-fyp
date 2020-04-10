const db = require("./../db");
var express = require("express");
var router = express.Router();

var allCourses = "SELECT ucas_code, course_name, course_spaces FROM Courses ORDER BY course_name ASC;"

router.get('/', (req, res) => {
    db.query(allCourses, [])
    .then(response => {
        res.render('add-space-manually', {title: "Allocate Space", courses: response.rows});
    })
    .catch(err => {
        res.render('add-space-manually', {title: "Allocate Space", fail_message: "There has been a problem with connecting to our database. Please try again later."});
    })
})

router.post("/", (req, res) => {
    var course_to_update = req['body']['ucas_code'];
    db.query("UPDATE Courses SET course_spaces = course_spaces - 1 WHERE ucas_code = $1 AND course_spaces > 0;", [course_to_update])
        .then(response => {
            db.query(allCourses, [])
                .then(response => {
                    res.render('add-space-manually', {title: "Allocate Space", courses: response.rows});
                })
                .catch(err => {
                    res.render('add-space-manually', {title: "Allocate Space", fail_message: "There has been a problem with retrieving the list of courses. Please try again later."});
                })
            //res.render("index", {title: "Success"});
        })
        .catch(err => {
            res.render('add-space-manually', {title: "Allocate Space", fail_message: "There has been an issue with adding a space to the course at this time."});
        })
})

module.exports = router;