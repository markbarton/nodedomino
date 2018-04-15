const express = require("express");
const path = require("path");
const pjson = require("./package.json");
const port = ("port", process.env.PORT || 8088);
const app = express();
const rp = require("request-promise");

app.get("/demo", function(req, res, next) {
    const options = {
      uri: "http://Egghead1/nodejs.nsf/api/data/collections/name/all",
      resolveWithFullResponse: true
    };
  
    rp(options)
      .then(function(response) {
        const { headers, body } = response;
        if ("dominoauthenticationfailure" in headers) {
          // Authentication Failure - lets bat it back
          return res.status(401).send(headers.dominoauthenticationfailure);
        }
  
        return res.send(response.body);
      })
      .catch(function(err) {
        return res.status(err.response.statusCode).send(err.response.body);
      });
  });

// Serve static files
app.use(express.static("public"));

const server = app.listen(port);
console.log(`😁  ${pjson.name} running → PORT ${server.address().port}`);
