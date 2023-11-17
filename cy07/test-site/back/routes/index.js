var path = require("path");
var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

router.get("/mysql", function (req, res, next) {
  res.sendFile(path.join(__dirname, "..", "views", "mysql.html"));
});

router.get("/mysql/users", function (req, res, next) {
  // const userId = req.params.id;
  res.sendFile(path.join(__dirname, "..", "views", "userMySQL.html"));
});

router.get("/postgres", function (req, res, next) {
  res.sendFile(path.join(__dirname, "..", "views", "postgres.html"));
});

router.get("/postgres/users", function (req, res, next) {
  res.sendFile(path.join(__dirname, "..", "views", "userPostgres.html"));
});

module.exports = router;
