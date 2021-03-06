const db = require("./../db");
var express = require("express");
var router = express.Router();

router.get("/", (req, res) =>{
    res.render('add-course-programme', {title: "Add Course Programme"});
})

router.post('/', (req, res) => {
    var queryParams = [req['body']['ucas_code'],
        req['body']['course_description'], 
        req['body']['contact_details'], 
        req['body']['entry_requirements'], 
        req['body']['course_website'], 
        req['body']['course_name'], 
        req['body']['tuition_fees'],
        req['body']['course_spaces'],
        req['body']['course_type'],
        isUndergrad(req['body']['course_type'])
    ];

    insertRecord(queryParams)
        .then(response => {
            res.render('add-course-programme', {title: 'Add Course Programme', message: response['message']});
        })
        .catch(err => {
            res.render('add-course-programme', {title: 'Add Course Programme', message: err['message']});
        })
})


function insertRecord(record){
    return new Promise(function(resolve, reject){
        var queryString = "INSERT INTO Courses(ucas_code, description, contact_details, entry_requirements, website, course_name, tuition_fees, course_spaces, course_type, undergraduate_or_postgraduate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);";
        var vm = this;
        db.query(queryString, record)
            .then(response => {
                resolve({
                       status: true,
                       message: "Your course was successfully added."
                   })

            })
            .catch(err => {
                if(err.code === '23505') {
                    error_message = "This UCAS Code has already been used. Please use a different UCAS code for the course you wish to submit.";
                } else {
                    error_message = "There was an error. Please contact an administrator."
                }
                reject({
                    status: false,
                    message: error_message
                })
            })

    });

}


// list obtained from https://www.aber.ac.uk/en/undergrad/before-you-apply/ba-bsc-ma-msc-phd/
function isUndergrad(course_type){
    switch(course_type) {
        // Bachelor Degrees
        case 'BA':
        case 'BSc':
        case 'BENG':
        case 'LLB':
        // Integrated Masters Degrees
        case 'MARTS':
        case 'MBIOL':
        case 'MCOMP':
        case 'MENG':
        case 'MMATH':
        case 'MPHYS':
        case 'MSCI':
            return "Undergraduate";
        case 'MA':
        case 'MSc':
        case 'MBA':
        case 'MPhil':
        case 'MRes':
        case 'LLM':
        case 'PhD':
            return 'Postgraduate';
    }
}

module.exports = router;