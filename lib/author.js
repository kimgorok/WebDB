// 201935250 김현중

const db = require("./db");
var qs = require("querystring");

module.exports = {
  home: (req, res) => {
    db.query("SELECT * FROM author", (error, authors) => {
      var c = '<a href="/author/create">create</a>';
      var b = "<h2>Welcome!!</h2><p>Author Page</p>";
      var context = { list: authors, control: c, body: b };
      req.app.render("home", context, (err, html) => {
        res.end(html);
      });
    });
  },
  page: (req, res) => {
    var id = req.params.pageId;
    db.query("SELECT * FROM author", (error, authors) => {
      if (error) {
        throw error;
      }
      db.query(`SELECT * FROM author WHERE id = ${id}`, (error2, author) => {
        if (error2) {
          throw error2;
        }
        var c = `<a href="/author/create">create</a>&nbsp;&nbsp;<a href="/author/update/${author[0].id}">update</a>&nbsp;&nbsp;<a href="/author/delete/${author[0].id}" onclick='if(confirm("정말로 삭제하시겠습니까?")==false){ return false }'
        >delete</a>`;
        var b = `<h2>${author[0].name}</h2><p>${author[0].profile}</p>`;
        var context = { list: authors, control: c, body: b };
        req.app.render("home", context, (err, html) => {
          res.end(html);
        });
      });
    });
  },
  create: (req, res) => {
    db.query(`SELECT * FROM author`, (error, authors) => {
      if (error) {
        throw error;
      }
      var context = {
        list: authors,
        control: `<a href="/author/create">create</a>`,
        body: `<form action="/author/create_process" method="post">
         <p><input type="text" name="name" placeholder="name"></p>
         <p><textarea name="profile" placeholder="profile"></textarea></p>
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
     INSERT INTO author (name, profile)
     VALUES(?, ?)`,
        [post.name, post.profile],
        (error, result) => {
          if (error) {
            throw error;
          }
          res.writeHead(302, { Location: `/author/page/${result.insertId}` });
          res.end();
        }
      );
    });
  },
  update: function (request, response) {
    var _url = request.url;
    // var queryData = url.parse(_url, true).query;
    id = request.params.pageId;
    db.query("SELECT * FROM author", function (error, authors) {
      if (error) {
        throw error;
      }
      db.query(
        `SELECT * FROM author WHERE id=?`,
        [id],
        function (error2, author) {
          if (error2) {
            throw error2;
          }
          var context = {
            list: authors,
            control: `<a href="/author/create">create</a> <a href="/author/update/${author[0].id}">update</a>`,
            body: `<form action="/author/update_process" method="post">
      <input type="hidden" name="id" value="${author[0].id}">
      <p><input type="text" name="name" placeholder="name" value="${author[0].name}"></p>
      <p><textarea name="profile" placeholder="profile">${author[0].profile}</textarea></p>
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
        "UPDATE author SET name=?, profile=? WHERE id=?",
        [post.name, post.profile, post.id],
        (error, result) => {
          res.writeHead(302, { Location: `/author/page/${post.id}` });
          res.end();
        }
      );
    });
  },
  delete_process: (req, res) => {
    id = req.params.pageId;
    db.query("DELETE FROM author WHERE id = ?", [id], (error, result) => {
      if (error) {
        throw error;
      }
      res.writeHead(302, { Location: `/author` });
      res.end();
    });
  },
};
