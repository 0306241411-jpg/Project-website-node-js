const mysql = require("mysql2/promise");
const multer = require("multer");
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "csdl",
});
module.exports = pool;