const db = require("./../db");
var express = require("express");
var router = express.Router();

router.get('/', (req, res) => {
    getAllCourses()
        .then(response => {
            res.render('add-space-manually', {title: "Allocate Space", courses: response});
        })
        .catch(err => {
            res.render('add-space-manually', {title: "Allocate Space", fail_message: err});
        })
})

router.post("/", (req, res) => {
    var course_to_update = req['body']['ucas_code'];

    allocateSpace(course_to_update)
        .then(response => {
            getAllCourses()
                .then(resp => {
                    res.render('add-space-manually', {title: "Allocate Space", courses: resp});
                })
                .catch(err => {
                    res.render('add-space-manually', {title: "Allocate Space", fail_message: err});
                })
        })
        .catch(err => {
            res.render('add-space-manually', {title: "Allocate Space", fail_message: err['fail_message']});

        })
})

function getAllCourses(){
    return new Promise(function(resolve, reject){
        var allCourses = "SELECT ucas_code, course_name, course_spaces FROM Courses ORDER BY course_name ASC;"
        db.query(allCourses, [])
            .then(response => {
                resolve(response.rows);
            })
            .catch(err => {
                reject("There has been an issue retrieving courses from our database. If this issue persists, please contact a system administrator.");
            })
    })
}

function allocateSpace(ucas_code){
    return new Promise(function(resolve, reject){
        db.query("UPDATE Courses SET course_spaces = course_spaces - 1 WHERE ucas_code = $1 AND course_spaces > 0;", [ucas_code])
            .then(response => {
                resolve()
            })
            .catch(err => {
                reject({
                    fail_message: 'There has been an issue with adding a space to the course at this time'
                })
            })
    })
}

module.exports = router;