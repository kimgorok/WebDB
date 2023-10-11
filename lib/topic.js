const db = require("./db");
var qs = require("querystring");

module.exports = {
  home: (req, res) => {
    var context = {
      list: [],
      title: null,
      control: null,
      body: null,
    };
    res.render("home", context);
  },
  page: (req, res) => {
    var id = req.params.pageId;
    db.query("SELECT * FROM topic", (error, topics) => {
      if (error) {
        throw error;
      }
      db.query(`SELECT * FROM topic WHERE id = ${id}`, (error2, topic) => {
        if (error2) {
          throw error2;
        }
        var c = `<a href="/create">create</a>&nbsp;&nbsp;<a href="/update/${topic[0].id}">update</a>&nbsp;&nbsp;<a href="/delete/${topic[0].id}" onclick='if(confirm("정말로 삭제하시겠습니까?")==false){ return false }'
        >delete</a>`;
        var b = `<h2>${topic[0].title}</h2><p>${topic[0].descrpt}</p>`;
        var context = { list: topics, control: c, body: b };
        req.app.render("home", context, (err, html) => {
          res.end(html);
        });
      });
    });
  },
  create: (req, res) => {
    db.query(`SELECT * FROM topic`, (error, topics) => {
      if (error) {
        throw error;
      }
      var context = {
        list: topics,
        control: `<a href="/create">create</a>`,
        body: `<form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p><textarea name="description" placeholder="description"></textarea></p>
        <p><input type="submit"></p>
        </form>`,
      };
      req.app.render("home", context, (err, html) => {
        res.end(html);
      });
    });
  },
  create_process: (req, res) => {
    var body = "";
    req.on("data", (data) => {
      body = body + data;
    });
    req.on("end", () => {
      var post = qs.parse(body);
      db.query(
        `
    INSERT INTO topic (title, descrpt, created) 
    VALUES(?, ?, NOW())`,
        [post.title, post.description],
        (error, result) => {
          if (error) {
            throw error;
          }
          res.writeHead(302, { Location: `/page/${result.insertId}` });
          res.end();
        }
      );
    });
  },
  update: function (request, response) {
    var _url = request.url;
    //var queryData = url.parse(_url, true).query;
    id = request.params.pageId;
    db.query("SELECT * FROM topic", function (error, topics) {
      if (error) {
        throw error;
      }
      db.query(
        `SELECT * FROM topic WHERE id=?`,
        [id],
        function (error2, topic) {
          if (error2) {
            throw error2;
          }
          var context = {
            list: topics,
            control: `<a href="/create">create</a> <a href="/update/${topic[0].id}">update</a>`,
            body: `<form action="/update_process" method="post">
    <input type="hidden" name="id" value="${topic[0].id}">
    <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
    <p><textarea name="description" placeholder="description">${topic[0].descrpt}</textarea></p>
    <p><input type="submit"></p>
    </form>`,
          };
          request.app.render("home", context, function (err, html) {
            response.end(html);
          });
        }
      );
    });
  },
  update_process: (req, res) => {
    var body = "";
    req.on("data", (data) => {
      body = body + data;
    });
    req.on("end", () => {
      var post = qs.parse(body);
      db.query(
        "UPDATE topic SET title=?, descrpt=? WHERE id=?",
        [post.title, post.description, post.id],
        (error, result) => {
          res.writeHead(302, { Location: `/page/${post.id}` });
          res.end();
        }
      );
    });
  },
  delete_process: (req, res) => {
    id = req.params.pageId;
    db.query("DELETE FROM topic WHERE id = ?", [id], (error, result) => {
      if (error) {
        throw error;
      }
      res.writeHead(302, { Location: `/` });
      res.end();
    });
  },
};
