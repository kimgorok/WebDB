const db = require("./db");
var qs = require("querystring");
var cookie = require("cookie");
var sanitizeHtml = require("sanitize-html");
function authIsOwner(req, res) {
  var isOwner = false;
  var cookies = {};
  if (req.headers.cookie) {
    cookies = cookie.parse(req.headers.cookie);
  }
  if (cookies.email === "a" && cookies.password === "a") {
    isOwner = true;
  }
  return isOwner;
}
function authStatusUI(req, res) {
  var login = `<a href="login">login</a>`;
  if (authIsOwner(req, res)) {
    login = '<a href="/logout_process">logout</a>';
  }
  return login;
}
module.exports = {
  home: (req, res) => {
    db.query("SELECT * FROM topic", (error, topics) => {
      var login = authStatusUI(req, res);

      var c = '<a href="/create">create</a>';
      var b = "<h2>Welcome</h2><p>Node.js Start Page</p>";
      var context = {
        lg: login,
        list: topics,
        control: c,
        body: b,
        title: "Topics",
      };
      console.log(context);
      res.render("home", context);
    });
  },
  page: (req, res) => {
    var id = req.params.pageId;
    db.query("SELECT * FROM topic", (error, topics) => {
      if (error) {
        throw error;
      }
      db.query(
        `SELECT * FROM topic LEFT JOIN author ON topic.author_id = author.id WHERE topic.id = ${id}`,
        (error2, topic) => {
          if (error2) {
            throw error2;
          }
          var c = `<a href="/create">create</a>&nbsp;&nbsp;<a href="/update/${id}">update</a>&nbsp;&nbsp;<a href="/delete/${id}" onclick='if(confirm("정말로 삭제하시겠습니까?")==false){ return false }'
        >delete</a>`;
          var b = `<h2>${topic[0].title}</h2><p>${topic[0].descrpt}</p>
          <p>by ${topic[0].name}</p>`;
          var context = {
            list: topics,
            control: c,
            body: b,
            title: "Page",
            lg: null,
          };
          res.render("home", context);
        }
      );
    });
  },
  create: (req, res) => {
    if (authIsOwner(req, res) === false) {
      res.end(`<script type='text/javascript'>alert("Login required ~~~") <!--
    setTimeout("location.href='http://localhost:3000/'",1000);
    //-->
    </script>`);
    }
    db.query(`SELECT * FROM topic`, (error, topics) => {
      if (error) {
        throw error;
      }
      db.query(`SELECT * FROM author`, (err, authors) => {
        var i = 0;
        var tag = "";
        while (i < authors.length) {
          tag += `<option value="${authors[i].id}">${authors[i].name}</option>`;
          i++;
        }
        console.log(tag);
        var context = {
          title: "Create",
          lg: null,
          list: topics,
          control: `<a href="/create">create</a>`,
          body: `<form action="/create_process" method="post">
                <p><input type="text" name="title" placeholder="title"></p>
                <p><textarea name="description" placeholder="description"></textarea></p> <p><input type="submit"></p>
                <p><select name="author">${tag}</select></p>
                </form>`,
        };
        res.render("home", context, (err, html) => {
          res.end(html);
        });
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
      sanitizedTitle = sanitizeHtml(post.title);
      sanitizedDescription = sanitizeHtml(post.description);
      sanitizedAuthor = sanitizeHtml(post.author);
      db.query(
        `
            INSERT INTO topic (title, descrpt, created, author_id)
                 VALUES(?, ?, NOW(), ?)`,
        [sanitizedTitle, sanitizedDescription, sanitizedAuthor],
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
    // var _url = request.url;
    // var queryData = url.parse(_url, true).query;
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
          db.query(`SELECT * FROM author`, (err, authors) => {
            if (err) {
              throw err;
            }
            var i = 0;
            var tag = "";
            while (i < authors.length) {
              var selected = "";
              if (authors[i].id === topic[0].author_id) {
                selected = " selected";
              }
              tag += `<option value="${authors[i].id}"${selected}>${authors[i].name}</option>`;
              i++;
            }
            var context = {
              list: topics,
              control: `<a href="/create">create</a> <a href="/update/${topic[0].id}">update</a>`,
              body: `<form action="/update_process" method="post">
              <input type="hidden" name="id" value="${topic[0].id}">
              <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
              <p><textarea name="description" placeholder="description">${topic[0].descrpt}</textarea></p>
              <p><select name="author">${tag}</select></p>
              <p><input type="submit"></p>    
              </form>`,
            };
            response.render("home", context, function (err, html) {
              response.end(html);
            });
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
      sanitizedTitle = sanitizeHtml(post.title);
      sanitizedDescription = sanitizeHtml(post.description);
      sanitizedAuthor = sanitizeHtml(post.author);
      db.query(
        "UPDATE topic SET title=?, descrpt=?, author_id = ? WHERE id=?",
        [sanitizedTitle, sanitizedDescription, sanitizedAuthor, post.id],
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
      res.writeHead(302, { Location: "/" });
      res.end();
    });
  },
  login: (req, res) => {
    db.query("SELECT * FROM topic", (error, topics) => {
      var login = "";
      login = `<a href="/login"> login </a>`;
      var c = '<a href="/create">create</a>';
      var b = `<form action = "/login_process" method="post">
      <p><input type = "text" name="email" placeholder="email"></textarea></p>
      <p><input type = "text"  name="password" placeholder="password"></textarea></p>
      <p><input type="submit"></p></form>`;

      var context = {
        lg: login,
        title: "WEB",
        list: topics,
        control: c,
        body: b,
      };
      req.app.render("home", context, (err, html) => {
        res.end(html);
      });
    });
  },
  login_process: (req, res) => {
    var body = "";
    req.on("data", (data) => {
      body += data;
    });
    req.on("end", () => {
      var post = qs.parse(body);
      if (post.email === "a" && post.password === "a") {
        res.writeHead(302, {
          "Set-Cookie": [
            `email = ${post.email}`,
            `password=${post.password}`,
            `nickname=egoing`,
          ],
          Location: "/",
        });
        res.end();
      } else {
        res.end("Who?");
      }
    });
  },
  logout_process: (req, res) => {
    res.writeHead(302, {
      "Set-Cookie": [
        `email= ; Max-Age=0`,
        `passowrd= ; Max-Age=0`,
        `nickname= ; Max-Age=0`,
      ],
      Location: "/",
    });
    res.end();
  },
};
