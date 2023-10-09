const db = require("./db");

module.exports = {
  author: (req, res) => {
    db.query("SELECT * FROM author", (error, results) => {
      var lists = '<ol type="1">';
      var i = 0;
      while (i < results.length) {
        lists = lists + `<li><a href="#">${results[i].name}</a></li>`;
        i = i + 1;
      }
      lists = lists + "</ol> ";
      var context = {
        list: lists,
        title: "Welcome-db Author",
      };

      res.render("home", context, (err, html) => {
        res.end(html);
      });
    });
    db.end();
  },
};
