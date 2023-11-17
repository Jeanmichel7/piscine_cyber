var path = require("path");
var express = require("express");
var router = express.Router();
var db_mysql = require("../dbMySQL");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/test", function (req, res, next) {
  res.json("test");
});

router.get("/users", function (req, res, next) {
  // var userId = req.params.id;
  const userId = req.query.user;
  console.log("userId", userId);

  db_mysql.on("error", function (err) {
    console.log("Erreur de connexion DB", err);
  });

  db_mysql.query(
    "SELECT id, username, description FROM users WHERE id = " + userId,
    // [userId],
    function (error, results, fields) {
      if (error) {
        res.status(500).send(error);
      } else {
        if (results.length) {
          res.json(results);
        } else {
          res.status(404).send({ error: "No data" });
        }
      }
    }
  );
});

router.post("/auth", function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  console.log("req body", req.body);

  db_mysql.on("error", function (err) {
    console.log("Erreur de connexion DB", err);
  });

  db_mysql.query(
    // "SELECT * FROM users WHERE username = ? AND password = ?",
    // [username, password],
    "SELECT * FROM users WHERE username = '" +
      username +
      "' AND password = '" +
      password +
      "'",
    [],
    function (error, results, fields) {
      if (error) {
        res.status(500).send(error);
      } else {
        console.log("results :\n", results);
        if (results.length) {
          res.json(results);
        } else {
          res.status(404).send({ error: "No data" });
        }
      }
    }
  );
});

module.exports = router;
