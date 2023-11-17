const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  password: "postgres",
  host: "postgres",
  port: 5432,
  database: "testdb",
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
