const { query } = require("express");
const db = require("./db");
var qs = require("querystring");
var sanitizeHtml = require("sanitize-html");
const { Script } = require("vm");

module.exports = {
  home: (req, res) => {
    db.query("SELECT * FROM topic", (error, topics) => {
      db.query("SELECT * FROM author", (err, authors) => {
        var i = 0;
        var tag = '<table border = "1" style="border-collapse: collapse;">';
        while (i < authors.length) {
          tag =
            tag +
            `<tr><td>${authors[i].name}</td><td>${authors[i].profile}</td><td><a 
    href="/author/update/${authors[i].id}">update</a></td><td><a href="/author/delete/${authors[i].id}" onclick='if(confirm("정말로 삭제하시겠습니까?")==false){ return false }'>delete</a></td>`;
          i += 1;
        }
        tag = tag + "</table>";
        var b = `<form action="/author/create_process" method="post">
    <p><input type="text" name="name" placeholder="name"></p>
    <p><input type="text" name="profile" placeholder="profile"></p>
    <p><input type="submit" value="생성"></p>
    </form> `;
        var context = {
          lg: login,
          title: "Author list",
          list: topics,
          control: tag,
          body: b,
        };
        req.app.render("home", context, (err, html) => {
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
      sanitizedName = sanitizeHtml(post.name);
      sanitizedProfile = sanitizeHtml(post.profile);
      db.query(
        `
    INSERT INTO author (name, profile)
    VALUES(?, ?)`,
        [sanitizedName, sanitizedProfile],
        (error, result) => {
          if (error) {
            throw error;
          }
          //res.writeHead(302, {Location: `/page/${result.insertId}`});
          res.redirect(`/author`);
          res.end();
        }
      );
    });
  },

  update: (req, res) => {
    const update_id = req.params.pageId;
    db.query("SELECT * FROM topic", (error, topics) => {
      db.query(
        "SELECT * FROM author WHERE id=?",
        [update_id],
        (error2, author) => {
          db.query("SELECT * FROM author", (err, authors) => {
            var i = 0;
            var tag = '<table border = "1" style="border-collapse: collapse;">';
            while (i < authors.length) {
              tag =
                tag +
                `<tr><td>${authors[i].name}</td><td>${authors[i].profile}</td><td><a 
href="/author/update/${authors[i].id}">update</a></td><td><a href="/author/delete/${author[0].id}">delete</a></td>`;
              i++;
            }
            tag = tag + "</table>";

            var context = {
              title: "Author list",
              list: topics,
              control: tag,
              body: `<form action="/author/update_process" method="post">
      <input type="hidden" name="id" value="${update_id}">
      <p><input type="text" name="name" placeholder="name" value="${author[0].name}"></p>
      <p><textarea name="profile" placeholder="profile">${author[0].profile}</textarea></p>
      <p><input type="submit" value="생성"></p>
  </form> `,
            };
            req.app.render("home", context, (err, html) => {
              res.end(html);
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
      sanitizedName = sanitizeHtml(post.name);
      sanitizedProfile = sanitizeHtml(post.profile);
      sanitizedId = sanitizeHtml(post.id);
      db.query(
        "UPDATE author SET name=?, profile=? WHERE id=?",
        [sanitizedName, sanitizedProfile, sanitizedId],
        (error, result) => {
          res.writeHead(302, { Location: `/author` });
          res.end();
        }
      );
    });
  },

  delete_process: (req, res) => {
    delete_id = req.params.pageId;
    db.query(
      "Select * from topic where author_id =?",
      [delete_id],
      (error, result) => {
        if (result.length > 0) {
          res
            .status(200)
            .send(
              "<script>alert('topic이 존재하여 삭제할 수 없습니다.'); window.location.href = '/author';</script>"
            );
        } else {
          db.query(
            "DELETE FROM author WHERE id = ?",
            [delete_id],
            (error, result) => {
              if (result) res.writeHead(302, { Location: `/author` });
              res.end();
            }
          );
        }
      }
    );
  },
};
