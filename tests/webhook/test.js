const app = require('./../../index.js');
const supertest = require('supertest');
const request = supertest(app);
const db = require('./../../db');

it('get course spaces', async done => {
    const response = await request
        .post('/getcourse')
        .send({
            "queryResult": {
                "queryText": "What grades do I need to study Computer Science?",
                "parameters": {
                    "Course": "Computer Science"
                },
                "allRequiredParamsPresent": true,
                "outputContexts": [
                    {
                        "name": "projects/clearing-bot-voltbp/agent/sessions/b7e18c2f-8172-f5ba-b65b-afdca867eaaf/contexts/__system_counters__",
                        "parameters": {
                            "no-input": 0,
                            "no-match": 0,
                            "Course": "Law",
                            "Course.original": "Law"
                        }
                    }
                ],
                "intent": {
                    "name": "projects/clearing-bot-voltbp/agent/intents/e7f0c658-6b1c-47ce-b427-f817a781cb38",
                    "displayName": "Course Description"
                },
                "intentDetectionConfidence": 1,
                "languageCode": "en"
            },
            "session": "projects/clearing-bot-voltbp/agent/sessions/b7e18c2f-8172-f5ba-b65b-afdca867eaaf",
            "alternativeQueryResults": [
                {
                    "queryText": "What grades do I need to study Computer Science?",
                    "languageCode": "en"
                }
            ]
        })

    expect(response.status).toBe(200);
    db.close();
    done()
})