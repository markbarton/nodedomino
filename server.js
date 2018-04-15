const express = require("express");
const path = require("path");
const pjson = require("./package.json");
const port = ("port", process.env.PORT || 8088);
const app = express();
const rp = require("request-promise");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const setCookie = require("set-cookie-parser");
const cheerio = require("cheerio");
const exphbs = require("express3-handlebars");
const hbs = exphbs.create({
  defaultLayout: "default",
  extname: ".handlebars"
});
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

app.use(bodyParser.json());

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
app.post("/login", function(req, res, next) {
  const { Username, Password } = req.body;
  const options = {
    uri: "http://Egghead1/names.nsf?login",
    resolveWithFullResponse: true,
    form: { Username, Password },
    simple: false
  };
  rp
    .post(options)
    .then(function(response) {
      const { headers, body } = response;
      const dominoauthenticationfailure = headers.dominoauthenticationfailure;

      if (dominoauthenticationfailure) {
        // authentication failure
        return res.status(401).send(dominoauthenticationfailure);
      }

      // Decode cookies
      const cookies = setCookie.parse(response, {
        decodeValues: true
      });

      //filter cookies to only DomAuthSessId
      const domino_auth_cookie = cookies.filter(function(cookie) {
        return cookie.name === "DomAuthSessId";
      });

      if (domino_auth_cookie.length > 0) {
        return res.send(domino_auth_cookie[0].value);
      }

      return res.send(body);
    })
    .catch(function(err) {
      console.log(err);
      return res.send(err);
    });
});
app.get("/dominodata", function(req, res, next) {
  const { nodedomauthsessid, authorization } = req.headers;
  if (!authorization) {
    return res.status(401).send("Missing Token");
  }

  let token = authorization;
  if (authorization.includes("Bearer")) {
    token = authorization.substring(7);
  }

  try {
    const decoded = jwt.verify(token, "egghead");
    const { username, roles } = decoded;
    if (!roles.includes("Test")) {
      return res.status(403).send("Test Role Required");
    }
  } catch (err) {
    return res.status(401).send("Bad Token");
  }

  const options = {
    uri: "http://Egghead1/nodejs.nsf/api/data/collections/name/all",
    resolveWithFullResponse: true,
    headers: {
      Cookie: `DomAuthSessId=${nodedomauthsessid}`
    }
  };

  rp(options)
    .then(function(response) {
      const { headers, body } = response;
      const dominoauthenticationfailure = headers.dominoauthenticationfailure;
      if (dominoauthenticationfailure) {
        return res.status(401).send(dominoauthenticationfailure);
      }
      return res.send(response.body);
    })
    .catch(function(err) {
      return res.status(err.response.statusCode).send(err.response.body);
    });
});
app.get("/userroles", function(req, res, next) {
  const { nodedomauthsessid } = req.headers;
  if (!nodedomauthsessid) {
    return res.status(401).send(`No NodeDomAuthSessId header`);
  }

  const option = {
    uri: "http://Egghead1/nodejs.nsf/user?openpage",
    resolveWithFullResponse: true,
    headers: {
      Cookie: `DomAuthSessId=${nodedomauthsessid}`
    },
    json: true
  };

  rp(option)
    .then(function(response) {
      const { headers, body } = response;
      if ("dominoauthenticationfailure" in headers) {
        // Authentication Failure - lets bat it back
        return res.status(401).send(headers.dominoauthenticationfailure);
      }
      const { username, roles } = response.body.user;
      const today = new Date();
      const exp = new Date(today);
      exp.setDate(today.getDate() + 7);
      const payload = jwt.sign(
        {
          username,
          roles,
          exp: parseInt(exp.getTime() / 1000, 10)
        },
        "egghead"
      );

      return res.send(payload);
    })
    .catch(function(err) {
      console.log(err);
      return res.status(err.response.statusCode).send(err.response.body);
    });
});
app.post("/swrecord", function(req, res, next) {
  const { nodedomauthsessid } = req.headers;
  if (!nodedomauthsessid) {
    return res.status(401).send(`No NodeDomAuthSessId header`);
  }
  const options = {
    uri: "http://Egghead1/nodejs.nsf/api/data/documents?form=starwars_record",
    headers: {
      cookie: `DomAuthSessId=${nodedomauthsessid}`
    },
    body: req.body,
    json: true,
    resolveWithFullResponse: true
  };
  rp
    .post(options)
    .then(function(response) {
      const { dominoauthenticationfailure, location } = response.headers;
      if (dominoauthenticationfailure) {
        return res.status(401).send(dominoauthenticationfailure);
      }
      const redirect_option = {
        uri: location,
        headers: {
          cookie: `DomAuthSessId=${nodedomauthsessid}`
        },
        json: true,
        resolveWithFullResponse: true
      };
      rp
        .get(redirect_option)
        .then(function(response) {
          return res.send(response.body);
        })
        .catch(function(err) {
          console.log(err);
          return res.status(err.statusCode).send(err.error.message);
        });
    })
    .catch(function(err) {
      console.log(err);
      return res.status(err.statusCode).send(err.error.message);
    });
});
app.get("/swrecords", function(req, res, next) {
  const { nodedomauthsessid } = req.headers;
  if (!nodedomauthsessid) {
    return res.status(401).send(`No NodeDomAuthSessId header`);
  }
  const options = {
    uri: "http://Egghead1/nodejs.nsf/api/data/collections/name/star_wars",
    resolveWithFullResponse: true,
    headers: {
      Cookie: `DomAuthSessId=${nodedomauthsessid}`
    }
  };
  rp(options)
    .then(function(response) {
      const { headers, body } = response;
      const dominoauthenticationfailure = headers.dominoauthenticationfailure;
      if (dominoauthenticationfailure) {
        return res.status(401).send(dominoauthenticationfailure);
      }
      return res.send(response.body);
    })
    .catch(function(err) {
      return res.status(err.response.statusCode).send(err.response.body);
    });
});
app.get("/swrecords/:unid", function(req, res, next) {
  const { nodedomauthsessid } = req.headers;
  if (!nodedomauthsessid) {
    return res.status(401).send(`No NodeDomAuthSessId header`);
  }
  const options = {
    uri: `http://Egghead1/nodejs.nsf/api/data/documents/unid/${
      req.params.unid
    }`,
    resolveWithFullResponse: true,
    headers: {
      Cookie: `DomAuthSessId=${nodedomauthsessid}`
    }
  };
  rp(options)
    .then(function(response) {
      const { headers, body } = response;
      const dominoauthenticationfailure = headers.dominoauthenticationfailure;
      if (dominoauthenticationfailure) {
        return res.status(401).send(dominoauthenticationfailure);
      }
      return res.send(response.body);
    })
    .catch(function(err) {
      return res.status(err.response.statusCode).send(err.response.body);
    });
});
app.patch("/swrecords/:unid", function(req, res, next) {
  const { nodedomauthsessid } = req.headers;
  if (!nodedomauthsessid) {
    return res.status(401).send(`No NodeDomAuthSessId header`);
  }

  const options = {
    uri: `http://Egghead1/nodejs.nsf/api/data/documents/unid/${
      req.params.unid
    }`,
    headers: {
      cookie: `DomAuthSessId=${nodedomauthsessid}`,
      "X-HTTP-Method-Override": `PATCH`
    },
    body: req.body,
    json: true,
    resolveWithFullResponse: true
  };

  rp
    .post(options)
    .then(function(response) {
      const { dominoauthenticationfailure, location } = response.headers;
      if (dominoauthenticationfailure) {
        return res.status(401).send(dominoauthenticationfailure);
      }
      res.send(response.body);
    })
    .catch(function(err) {
      return res.status(err.statusCode).send(err.error.message);
    });
});
app.delete("/swrecords/:unid", function(req, res, next) {
  const { nodedomauthsessid } = req.headers;
  if (!nodedomauthsessid) {
    return res.status(401).send(`No NodeDomAuthSessId header`);
  }

  const options = {
    uri: `http://Egghead1/nodejs.nsf/api/data/documents/unid/${
      req.params.unid
    }`,
    headers: {
      cookie: `DomAuthSessId=${nodedomauthsessid}`
    },
    method: "DELETE",
    resolveWithFullResponse: true,
    json: true
  };

  rp(options)
    .then(function(response) {
      const { dominoauthenticationfailure, location } = response.headers;
      if (dominoauthenticationfailure) {
        return res.status(401).send(dominoauthenticationfailure);
      }
      res.send(response.body);
    })
    .catch(function(err) {
      return res.status(err.statusCode).send(err.error.message);
    });
});
app.get("/render_data", function(req, res, next) {
  const options = {
    url: `http://Egghead1/nodejs.nsf/api/data/collections/name/star_wars`,
    method: "GET",
    resolveWithFullResponse: true,
    json: true
  };

  rp(options)
    .then(function(response) {
      const records = response.body;
      res.render("demo", { records });
    })
    .catch(function(err) {
      res.status(err.statusCode).send(err.response);
    });
});

app.get("/render_html", function(req, res, next) {
  const options = {
    url: "http://Egghead1/nodejs.nsf/star_web?readform",
    method: "GET",
    resolveWithFullResponse: true
  };

  rp(options).then(function(response) {
    const html = response.body;
    const $ = cheerio.load(html);
    const records_html = $("#records");
   $("#records img").each(function(i, elem) {
      $(this).attr("src", "http://egghead1/" + $(this).attr("src"));
    });
    $("#records button").remove();

    res.render("domino_html", { records_html });
  });
});

// Serve static files
app.use(express.static("public"));

const server = app.listen(port);
console.log(`😁  ${pjson.name} running → PORT ${server.address().port}`);
