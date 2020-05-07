const app = require('./../../index.js');
const supertest = require('supertest');
const request = supertest(app);
const db = require('./../../db');

it('get course spaces', async done => {
    const response = await request
        .post('/getcourse')
        .send({
            "queryResult": {
                "parameters": {
                    "Course": "Computer Science"
                },
                "intent": {
                    "name": "projects/clearing-bot-voltbp/agent/intents/e7f0c658-6b1c-47ce-b427-f817a781cb38",
                    "displayName": "Course Description"
                },
                "intentDetectionConfidence": 1,
                "languageCode": "en"
            },
            "session": "projects/clearing-bot-voltbp/agent/sessions/b7e18c2f-8172-f5ba-b65b-afdca867eaaf",
        })

    expect(response.status).toBe(200);
    expect(response.body.fulfillmentText).toBe("The wider the workplace applications of computers, the greater the challenge for IT professionals. BSc (Hons) Computer Science aims to produce Graduate Software Engineers who specialise in object-oriented software design and implementation.    The practical orientation of our programmes will enable you to gain the range of professional and technical skills you will need to design and deliver the next generation of high-quality software systems.    You will develop expertise in software development and the key applications of computing science in each year of the programme. Particular emphasis is placed on applications in industry and commerce.    Your final-year project and options will enable you to follow specialisms of particular interest or career relevance. Your project could be based on a topic from an extensive list or you can suggest your own, perhaps based on your professional placement.    Aston University's BSc (Hons) Computer Science degrees are accredited for Chartered IT Professional (CITP), the British Computer Society's Chartered qualification. This gives students the right to join the BCS - the principal organisation for IT professionals in the UK - when they graduate.  Accreditation shows that the BCS consider the courses are up to date, are based on benchmarks, and assessed appropriately.")
    //db.close();
    done()
})

it('get course spaces', async done => {
    const response = await request
        .post('/getcourse')
        .send({
            "queryResult": {
                "parameters": {
                    "Course": "Computer Science"
                },
                "intent": {
                    "name": "projects/clearing-bot-voltbp/agent/intents/e7f0c658-6b1c-47ce-b427-f817a781cb38",
                    "displayName": "Course Spaces"
                },
                "intentDetectionConfidence": 1,
                "languageCode": "en"
            },
            "session": "projects/clearing-bot-voltbp/agent/sessions/b7e18c2f-8172-f5ba-b65b-afdca867eaaf",
        })

    expect(response.status).toBe(200);
    expect(response.body.fulfillmentText).toBe("There are no spaces left on Computer Science.")
    
    done();
})

it('get modules', async done => {
    const response = await request
        .post('/getcourse')
        .send({
            "queryResult": {
                "parameters": {
                    "Course": "Computer Science"
                },
                "intent": {
                    "name": "projects/clearing-bot-voltbp/agent/intents/e7f0c658-6b1c-47ce-b427-f817a781cb38",
                    "displayName": "Modules"
                },
                "intentDetectionConfidence": 1,
                "languageCode": "en"
            },
            "session": "projects/clearing-bot-voltbp/agent/sessions/b7e18c2f-8172-f5ba-b65b-afdca867eaaf",
        })

    expect(response.status).toBe(200);
    expect(response.body.fulfillmentText).toBe("You will study the following modules: 'Internet Applications and Database Design', and 'Professional and Social Aspects of Computing'.")
    done()

})


afterAll(() => {
    db.close();
})