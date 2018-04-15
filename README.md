# Egghead NodeJS & IBM Domino Integration Course
## Lesson 8 - Decode and Verify JWT in Express

For this lesson you will need to enable an Admin role in the ACL for the example Notes database for your Test User.

You will need to modify the example code in the server.js to check for the Admin role / Test role - it is currently set to the Test role which does not exist and therefore will throw a 403.

You must do a npm install after switching to this branch.

An example form will be served from the public folder via the NodeJS server.

This example HTML file references some external libraries via a CDN (Bootstrap, fontawesome, axios)

You will need to modify the login URL and Get Domino Data to your Domino Server and then use your credentials when logging in. These URLs are in the server.js file.

The Example NSF file can be found in lesson 1 - [https://github.com/markbarton/nodedomino/blob/lesson1/nodejs.nsf]