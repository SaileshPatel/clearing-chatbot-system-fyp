# Clearing Chatbot Dialogflow Webhook & Database Management System

## Project Details
This project concerns the development of a chatbot to aid the University clearing admissions process. This repository provides the webhook used by the chatbot to obtain data from the PostgreSQL database and the course information management system which allows administrators to upload and delete courses, as well as remove available spaces from courses. 

**Author**: Sailesh Patel (160034811)

**Project Supervisor**: Dr Sylvia Wong

## Software Requirements
These instructions have been run on MacOS.
These instructions presume you have the following software on your computer:
* [Git command line tools](https://www.atlassian.com/git/tutorials/install-git)
* [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
* [Node.js](https://nodejs.org/en/)
* [npm](https://www.npmjs.com/get-npm)
* [PostgreSQL](https://devcenter.heroku.com/articles/heroku-postgresql#local-setup)

**Note: The PostgreSQL instructions from Heroku as opposed to PostgreSQL - this is because the Heroku instructions teach you how to configure the local database so the project can use it**


## How to install/run
1. Clone the repository into your local machine
2. Using the command line (or terminal), navigate to the location where you have cloned the repository and run the command `npm install` to install all the dependencies the project requires
3. Before executing the program, use the following commands to create the relevant enums and tables required in your PostgreSQL database

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
    ucas_code character varying(4) COLLATE pg_catalog."default" NOT NULL,
    description character varying(10000) COLLATE pg_catalog."default" NOT NULL,
    contact_details character varying(5000) COLLATE pg_catalog."default" NOT NULL,
    entry_requirements character varying(5000) COLLATE pg_catalog."default" NOT NULL,
    website character varying(5000) COLLATE pg_catalog."default" NOT NULL,
    course_name character varying(5000) COLLATE pg_catalog."default" NOT NULL,
    tuition_fees character varying(5000) COLLATE pg_catalog."default" NOT NULL,
    course_spaces integer NOT NULL,
    course_type degree_awards NOT NULL,
    undergraduate_or_postgraduate undergrad_or_postgrad NOT NULL,
    CONSTRAINT courses_pkey PRIMARY KEY (ucas_code)
)
```


```
CREATE TABLE public.modules
(
    module_code character varying(6) COLLATE pg_catalog."default" NOT NULL,
    ucas_code character varying(4) COLLATE pg_catalog."default" NOT NULL,
    module_title character varying(100) COLLATE pg_catalog."default" NOT NULL,
    module_description character varying(10000) COLLATE pg_catalog."default" NOT NULL,
    optional boolean NOT NULL,
    credits integer NOT NULL,
    CONSTRAINT modules_pkey PRIMARY KEY (module_code),
    CONSTRAINT modules_ucas_code_fkey FOREIGN KEY (ucas_code)
        REFERENCES public.courses (ucas_code) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)
```

```
CREATE TABLE public.students
(
    student_id integer NOT NULL DEFAULT nextval('students_student_id_seq'::regclass),
    ucas_code character varying(4) COLLATE pg_catalog."default",
    first_name character varying(60) COLLATE pg_catalog."default",
    last_name character varying(60) COLLATE pg_catalog."default",
    date_of_birth date,
    gender character varying(10) COLLATE pg_catalog."default",
    email_address character varying(40) COLLATE pg_catalog."default",
    mobile_number character varying(20) COLLATE pg_catalog."default",
    previously_applied boolean,
    registered_with_ucas boolean,
    ucas_number integer,
    nationality_type character varying(50) COLLATE pg_catalog."default",
    five_gcses_or_not boolean,
    highest_english_qualification bytea,
    highest_mathematical_qualification bytea,
    highest_qualification bytea,
    agent_help boolean,
    agent_completed boolean,
    agent character varying(400) COLLATE pg_catalog."default",
    application_outcome character varying(400) COLLATE pg_catalog."default",
    ucas_status character varying(400) COLLATE pg_catalog."default",
    agent_email character varying(40) COLLATE pg_catalog."default",
    CONSTRAINT students_pkey PRIMARY KEY (student_id),
    CONSTRAINT students_ucas_code_fkey FOREIGN KEY (ucas_code)
        REFERENCES public.courses (ucas_code) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)
```
The instructions related to PostgreSQL can be found in more detail at [https://devcenter.heroku.com/articles/heroku-postgresql#local-setup](https://devcenter.heroku.com/articles/heroku-postgresql#local-setup)