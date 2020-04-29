const db = require("./../db");
var express = require("express");
var router = express.Router();

router.get('/', (req, res) => {
    res.render('upload-qualifications', {title: 'Upload Qualifications'});
});