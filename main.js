const express = require("express");
const app = express();

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

var db = require("./lib/db");
var topic = require("./lib/topic");
// const author = require("./lib/author");

// 이벤트리스너 get.

app.get("/", (req, res) => {
  topic.home(req, res);
});
// app.get("/author", (req, res) => {
//   author.author(req, res);
// });

app.get("/page/:pageId", (req, res) => {
  topic.page(req, res);
});

app.get("/create", (req, res) => {
  topic.create(req, res);
});

app.post("/create_process", (req, res) => {
  topic.create_process(req, res);
});

app.get("/update/:pageId", (req, res) => {
  topic.update(req, res);
});

app.post("/update_process", (req, res) => {
  topic.update_process(req, res);
});

app.get("/delete/:pageId", (req, res) => {
  topic.delete_process(req, res);
});

app.get("/favicon.ico", (req, res) => res.writeHead(404));
app.listen(3000, () => console.log("Example app listening on port 3000"));
