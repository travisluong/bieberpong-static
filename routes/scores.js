require("dotenv").config()
var express = require('express');
var router = express.Router();

var mysql = require("mysql");
var conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
})

router.post('/', async (req, res) => {
  conn.connect();
  const data = {name: req.body.name, score: req.body.score, country: req.body.country}

  conn.query("insert into scores set ?", data, function (error, results, fields) {
    if (error) throw error;
    conn.query("select * from scores order by score desc, created_at desc", function (error, results, fields) {
      if (error) throw error;
      console.log(results);
      res.send(results)
      conn.end();
    })
  })

})

router.get('/', async (req, res) => {
  conn.connect();

  conn.query("select * from scores order by created_at desc", function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    res.send(results)
  })

  conn.end();
})

module.exports = router;