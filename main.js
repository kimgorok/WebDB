// 201935250 김현중

const express = require("express");
const app = express();

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

var db = require("./lib/db");
var topic = require("./lib/topic");
var author = require("./lib/author");

app.get("/", (req, res) => {
  topic.home(req, res);
});

app.get("/author", (req, res) => {
  author.home(req, res);
});

app.get("/author/page/:pageId", (req, res) => {
  author.page(req, res);
});

app.get("/author/create", (req, res) => {
  author.create(req, res);
});

app.post("/author/create_process", (req, res) => {
  author.create_process(req, res);
});

app.get("/author/update/:pageId", (req, res) => {
  author.update(req, res);
});

app.post("/author/update_process", (req, res) => {
  author.update_process(req, res);
});

app.get("/author/delete/:pageId", (req, res) => {
  author.delete_process(req, res);
});

app.get("/favicon.ico", (req, res) => res.writeHead(404));
app.listen(3000, () => console.log("Example app listening on port 3000"));
