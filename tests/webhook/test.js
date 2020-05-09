const app = require('./../../index.js');
const supertest = require('supertest');
const request = supertest(app);
const db = require('./../../db');

it('course description matches Computer Science', async done => {
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

it('there are no course spaces on Computer Science', async done => {
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

it('there are 100 course spaces on Law', async done => {
    const response = await request
        .post('/getcourse')
        .send({
            "queryResult": {
                "parameters": {
                    "Course": "Law"
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
    expect(response.body.fulfillmentText).toBe("There are 198 spaces left on Law.")
    done();
})

it('there are two modules in Computer Science', async done => {
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

it('there is one module in Law', async done => {
    const response = await request
        .post('/getcourse')
        .send({
            "queryResult": {
                "parameters": {
                    "Course": "Law"
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
    expect(response.body.fulfillmentText).toBe("You still study the following module: 'Introduction to Tort Law'.");
    done();
})

it('there are no modules in Networking', async done => {
    const response = await request
        .post('/getcourse')
        .send({
            "queryResult": {
                "parameters": {
                    "Course": "Networking"
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
    expect(response.body.fulfillmentText).toBe("There are no modules associated with Networking currently.");
    done();
})


it('check that the correct entry requirements are given for Law', async done => {
    const response = await request
        .post('/getcourse')
        .send({
            "queryResult": {
                "parameters": {
                    "Course": "Law"
                },
                "intent": {
                    "name": "projects/clearing-bot-voltbp/agent/intents/e7f0c658-6b1c-47ce-b427-f817a781cb38",
                    "displayName": "Entry Requirements"
                },
                "intentDetectionConfidence": 1,
                "languageCode": "en"
            },
            "session": "projects/clearing-bot-voltbp/agent/sessions/b7e18c2f-8172-f5ba-b65b-afdca867eaaf",
        })
    
    expect(response.status).toBe(200);
    expect(response.body.fulfillmentText).toBe("5 GCSEs grades A*- C to include:  GCSE Maths – grade C/4  GCSE English Language OR English Literature– grade C/4    A Levels: BBB (standard offer), BBC (with EPQ or Core maths minimum grade B), BCC (Contextual offer)  IB: 31 points overall in the IB diploma with 5,5,5 at HL.   BTEC, Access & other: BTEC Extended Diploma DDD – standard offer  BTEC Extended Diploma DDM – Contextual offer  We accept the QAA-recognised Access Diploma which must consist of 45 credits at Level 3.   You must obtain a minimum of 30 distinction and the rest must be at merit or distinction. Please note that we do not accept the English and Maths components within the Access qualification and you must meet the GCSE entry requirement.");
    done();
})

it('check that the correct tuition fees are given for Law', async done => {
    const response = await request
        .post('/getcourse')
        .send({
            "queryResult": {
                "parameters": {
                    "Course": "Law"
                },
                "intent": {
                    "name": "projects/clearing-bot-voltbp/agent/intents/e7f0c658-6b1c-47ce-b427-f817a781cb38",
                    "displayName": "Tuition Fees"
                },
                "intentDetectionConfidence": 1,
                "languageCode": "en"
            },
            "session": "projects/clearing-bot-voltbp/agent/sessions/b7e18c2f-8172-f5ba-b65b-afdca867eaaf",
        })


    expect(response.status).toBe(200);
    expect(response.body.fulfillmentText).toBe("£9,250 (£1,250 during placement year) for UK/EU students.   £15,600* for International students (£2,500 during placement year) (2020/21)")
    done()
})

it('check that the correct contact details are given for Computer Science', async done => {
    const response = await request
        .post('/getcourse')
        .send({
            "queryResult": {
                "parameters": {
                    "Course": "Computer Science"
                },
                "intent": {
                    "name": "projects/clearing-bot-voltbp/agent/intents/e7f0c658-6b1c-47ce-b427-f817a781cb38",
                    "displayName": "Contact Details"
                },
                "intentDetectionConfidence": 1,
                "languageCode": "en"
            },
            "session": "projects/clearing-bot-voltbp/agent/sessions/b7e18c2f-8172-f5ba-b65b-afdca867eaaf",
        })

    expect(response.status).toBe(200);
    expect(response.body.fulfillmentText).toBe("EAS Undergraduate Admissions Office  +44 (0)121 204 3400  ugadmissions@aston.ac.uk");
    done()
})

afterAll(() => {
    db.close();
})