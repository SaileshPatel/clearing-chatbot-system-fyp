const db = require("./../db");

function query(){
    return new Promise(function(resolve, reject){
        db.query("SELECT * FROM Courses;")
            .then(response => {
                resolve(response);
            })
            .catch(err => {
                reject(err);
            })

    })
}


var apply = function(request, intent, intentClassification) {
    return new Promise(function(resolve, reject){
        query().then(r => {resolve(r)}).catch(e => reject(e));
    })
    
}

module.exports = apply;