const db = require("./../db");
var express = require("express");
var router = express.Router();

router.get('/', (req, res) => {
    var student_id = req.query.student_id;
    var id_exists = (typeof(student_id) != 'undefined');

    if(!id_exists){
        getAllStudentIDs()
            .then(response => {
                res.render('upload-qualifications', {title: 'Upload Qualifications', student_ids: response})
            })
            .catch(err => {
                res.render('upload-qualifications', {title: 'Upload Qualifications', error: true})
            })
    } else {
        res.render('upload-qualifications', {title: 'Upload Qualifications', student_id: student_id});
    }

});

router.post('/', (req, res) => {
    console.log(req.body);

    getAllStudentIDs()
        .then(response => {
            res.render('upload-qualifications', {title: 'Upload Qualifications', student_ids: response})
        })
        .catch(err => {
            res.render('upload-qualifications', {title: 'Upload Qualifications', error: true})
        })

})


function getAllStudentIDs(){
    return new Promise(function(resolve, reject){
        db.query("SELECT student_id FROM students ORDER BY student_id ASC;", [])
            .then(response => {
                resolve(response.rows);
            })
            .catch(err => {
                reject(err);
            })
    })
}

module.exports = router;