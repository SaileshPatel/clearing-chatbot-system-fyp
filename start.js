const express = require("express");
require("dotenv").config();

const app = require("./index.js");
const port = process.env.PORT || 3000;

app.listen(port, () =>{
    console.log(`Server is running at http://localhost:${port}`)
})

app.close();