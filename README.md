# Egghead NodeJS & IBM Domino Integration Course
This repo contains example code to go with the Egghead videos on Domino and NodeJS intergration

Each lesson in the Egghead course is associated with a different branch.

Just change to the required branch for the associated lesson to see the final code.

The example Notes Database is attached to the repo under the lesson 1 branch.

## Javascript Requirements
You must have a recent installation of NodeJS and you must do a NPM install after you clone this repo and after each branch change as each lesson incremently adds more packages.

This course uses some elements of ES6 javascript.

## IBM Domino Requirements
This course uses Domino Data Services for its examples as well as simple computed values.  It is expected you have access to a test Domino Server and you have rights to modify the standard login form in the domcfg database.

Change the ACL before copying to your Domino server and signing the database - make yourself a manager and set default = No Access and anonymous = No Access. Other lessons may change Anonymous to reader.

You will need to change the example URLS in the server.js file to point to your Domino Server.

