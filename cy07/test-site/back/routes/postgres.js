var path = require("path");
var express = require("express");
var router = express.Router();
var db = require("../dbPostgres");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/test", function (req, res, next) {
  res.json("test");
});

router.get("/users", async function (req, res, next) {
  // var userId = req.params.id;
  const userId = req.query.user;

  console.log("userId", userId);
  try {
    const result = await db.query(
      "SELECT id, username, description FROM users WHERE id = " + userId
    );
    console.log("result", result.rows);

    if (result.rows.length) {
      res.json(result.rows);
    } else {
      res.status(404).send({ error: "No data" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

router.post("/auth", async function (req, res, next) {
  try {
    console.log("req body", req.body);
    // const result = await db.query(
    //   "SELECT * FROM users WHERE username = $1 AND password = $2",
    //   [req.body.username, req.body.password]
    // );
    const request =
      "SELECT * FROM users WHERE username = '" +
      req.body.username +
      "' AND password = '" +
      req.body.password +
      "'";
    console.log("request", request);

    const result = await db.query(request);
    console.log("result", result);

    if (result.rows.length) {
      res.json(result.rows);
    } else {
      res.status(404).send({ error: "No data" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = router;
