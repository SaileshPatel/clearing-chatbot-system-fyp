const db = require("./../db");
var express = require("express");
var router = express.Router();

router.get('/', (req, res) => {
    var student_id = req.query.student_id;
    var id_exists = (typeof(student_id) != 'undefined');
    res.render('upload-qualifications', {title: 'Upload Qualifications', student_id: student_id, id_present: id_exists});
});


function getAllStudentIDs(){
    return new Promise(function(resolve, reject){
        db.query("SELECT student_id FROM students ORDER BY student_id ASC;", [])
            .then(response => {
                resolve(response.rows);
            })
            .catch(err => {
                reject("error: we were unable to retrieve values")
            })
    })
}

module.exports = router;