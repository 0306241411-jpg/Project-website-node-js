const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
//render index
router.get("/", (req, res) => {
  res.render("layout", {
    content: "index",
  });
});

//render category
router.get("/category", (req, res) => {
  res.render("layout", {
    content: "category",
  });
});

//render single
router.get("/single", (req, res) => {
  res.render("layout", {
    content: "single",
  });
});

//render contact
router.get("/contact", (req, res) => {
  res.render("layout", {
    content: "contact",
  });
});

//render login
router.get("/login", (req, res) => {
  res.render("login/login_layout", {
    content: "login",
  });
});

//kết nối mysql
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "node_mysql",
});

//kiểm tra kết nối mysql
db.connect((err) => {
  if (err) {
    console.error("Lỗi kết nối csdl. Chi tiết:" + err.stack);
    return;
  }
  console.log("Đã kết nối csdl thành công! ");
});

module.exports = router;
