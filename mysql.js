var mysql = require("mysql");

// 객체형태로 파라미터 넘겨주기
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "webdb2023",
});

connection.connect();

connection.query("SELECT * FROM topic", (error, results, fields) => {
  if (error) {
    console.log(error);
  }
  console.log(results);
  console.log(fields);
});

connection.end();
