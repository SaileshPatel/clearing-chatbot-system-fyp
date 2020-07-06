# Clearing Chatbot Dialogflow Webhook & Database Management System

## Project Details
This project was created as the deliverable of my final project at Aston University.

This project concerns the development of a chatbot to aid the University clearing admissions process. This repository provides the webhook used by the chatbot to obtain data from the PostgreSQL database and the course information management system which allows administrators to upload and delete courses, as well as remove available spaces from courses. 

**Author**: Sailesh Patel (160034811)

**Project Supervisor**: Dr Sylvia Wong

**Note: The instructions have been written using and presuming the use of a Macbook running MacOS due to developmental constraints** 

## Accounts Needed:
You will also need to have a Google Account to access Dialogflow, and a Heroku account to access Heroku.


## Software Requirements:
Links to relevant installation instructions have been included.
These instructions require you have the following software on your computer:
* [Git command line tools](https://www.atlassian.com/git/tutorials/install-git)
* [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
* [Node.js - v12.16.3](https://nodejs.org/en/)
* [npm - 6.14.5](https://www.npmjs.com/get-npm)
* [PostgreSQL](https://devcenter.heroku.com/articles/heroku-postgresql#local-setup)

**Note**: These instructions rely on your terminal.

**Note: The PostgreSQL instructions from Heroku as opposed to PostgreSQL - this is because the Heroku instructions teach you how to configure the local database so the project can use it**

The instructions related to PostgreSQL can be found in more detail at [https://devcenter.heroku.com/articles/heroku-postgresql#local-setup](https://devcenter.heroku.com/articles/heroku-postgresql#local-setup)


# Table of Contents
* [Local Installation](#local-installation)
* [Heroku Deployment](#heroku-deployment-instructions)


## Local Installation
1. Clone the repository into your local machine
2. Using the command line (or terminal), navigate to the location where you have cloned the repository and run the command `npm install` to install all the dependencies the project requires
3. Before executing the program, use the following commands to create the relevant enums and tables required in your PostgreSQL database. Open the PostgreSQL program and click the database with your username to open the command line interface

```
CREATE TYPE public.degree_awards AS ENUM
    ('Foundation', 'Degree Apprenticeship', 'BSc', 'BA', 'BEng', 'MBA', 'MBChB', 'LLB', 'PhD', 'MA', 'MSc', 'MPhil', 'MRes', 'MArts', 'MComp', 'MEng', 'MMath', 'MPhys', 'MSci', 'LLM');
```

```
CREATE TYPE public.undergrad_or_postgrad AS ENUM
    ('Undergraduate', 'Postgraduate');
```

```
CREATE TABLE public.courses
(
    ucas_code character varying(4),
    description character varying(10000),
    contact_details character varying(5000),
    entry_requirements character varying(5000),
    website character varying(5000),
    course_name character varying(5000),
    tuition_fees character varying(5000),
    course_spaces integer NOT NULL,
    course_type degree_awards NOT NULL,
    undergraduate_or_postgraduate undergrad_or_postgrad NOT NULL,
    CONSTRAINT courses_pkey PRIMARY KEY (ucas_code)
);
```


```
CREATE TABLE public.modules
(
    module_code character varying(6) NOT NULL,
    ucas_code character varying(4) NOT NULL,
    module_title character varying(100) NOT NULL,
    module_description character varying(10000) NOT NULL,
    optional boolean NOT NULL,
    credits integer NOT NULL,
    CONSTRAINT modules_pkey PRIMARY KEY (module_code),
    CONSTRAINT modules_ucas_code_fkey FOREIGN KEY (ucas_code)
        REFERENCES public.courses (ucas_code) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
```

```
CREATE TABLE public.students
(
    student_id SERIAL,
    ucas_code character varying(4),
    first_name character varying(60),
    last_name character varying(60),
    date_of_birth date,
    gender character varying(10),
    email_address character varying(40),
    mobile_number character varying(20),
    previously_applied boolean,
    registered_with_ucas boolean,
    ucas_number integer,
    nationality_type character varying(50),
    five_gcses_or_not boolean,
    highest_english_qualification bytea,
    highest_mathematical_qualification bytea,
    highest_qualification bytea,
    agent_help boolean,
    agent_completed boolean,
    agent character varying(400),
    application_outcome character varying(400),
    ucas_status character varying(400),
    agent_email character varying(40),
    CONSTRAINT students_pkey PRIMARY KEY (student_id),
    CONSTRAINT students_ucas_code_fkey FOREIGN KEY (ucas_code)
        REFERENCES courses (ucas_code) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
```

4. After running this commands in your PostgreSQL database, run the command `npm start` and you should be able to access the course database management system at `localhost:3000`

## Heroku Deployment Instructions
Now we will deploy our webhook and database management system to Heroku
1. Open your terminal and navigate to the directory
2. Run `npm install` to ensure all the dependencies are install 
3. Log into [Heroku](https://heroku.com/) and create a new app. Set the region to Europe and  **do not** set a pipeline.
4. After creating the app, you will see a series of instructions in the 'Deploy' tab to deploy the app using Heroku Git. Follow these instructions to deploy the webhook. 
5. Navigate to the web link for your new Heroku app - it should look like this  `https://[YOUR_APP_NAME].herokuapp.com/ `
6. You should now see the Home page. Go back to your app dashboard in Heroku.
7. Click on the Resource tab. In the Add-ons search bar, type in `Heroku Postgres`
8. You should provision the add-on to your app
9. In your terminal, run the following command `heroku pg:psql` to open your Heroku Postgres database using the Heroku CLI
10. Copy and paste the SQL commands from the previous **section** in the order they are presented i.e. degree award enum first. Exit after copying and pasting the SQL commands by entering `\q`
11. Open your Heroku app in the browser - go to `https://[YOUR_APP_NAME].herokuapp.com/ ` and try and add a course to see if your database has been added
12. We will now log into [Dialogflow](https://dialogflow.com/) to set up the chatbot.
13. Create a new Dialogflow agent
14. Click on the cog next to the agent name to access the settings
15. Open the `Export and Import` tab
16. Click  `Restore as ZIP` - this will remove all existing intents and entities
17. Upload the file named `Clearing-Bot.zip`
18. Once you have done this, click on  `Fulfillment` on the left hand side of the screen
19. Change the link from `https://chatbot-fyp-webhook.herokuapp.com/getcourse` to `https://[YOUR_APP_NAME].herokuapp.com/getcourse` and and click save at the bottom of the page
20. Click on the `Integrations` on the left hand side of the screen
21. Scroll down and find `Dialogflow Messenger`. Click the tab on the card to turn it on. 
22. Copy the script tag to your clipboard
23. Open `views\index.pug` in a text editor
24. Replace the existing script tag shown below in `index.pug` with the script tag you copied from Dialogflow
```
    <script src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1"></script>
    <df-messenger intent="WELCOME" chat-title="Clearing-Bot" agent-id="3246b9f6-7370-45fc-90f3-05fcf7895761" language-code="en"></df-messenger>
```
25. Make sure that the `<df-messenger>` opening tag is all on one line as in the example above 
26. In your terminal, type `git add -p` and add the change you have made
27. In your terminal, type `git commit -m "add my dialogflow messenger"`
28. In your terminal, type `git push heroku master`
29. You have now completed your deployment. 
29. You may wish to add some courses to your chatbot. Go to the 'Add Course Programme' page to add a course
