var mysql = require("mysql");

/* db mysql */
var db_mysql = mysql.createConnection({
  host: "mysql-db",
  user: "user",
  password: "userpassword",
  database: "testdb",
});

db_mysql.connect(function (err) {
  if (err) {
    console.error("Erreur de connexion à la base de données: " + err.stack);
    return;
  }
  console.log(
    "Connecté à la base de données mysql avec l'ID " + db_mysql.threadId
  );
});

module.exports = db_mysql;
