const express = require("express");
const router = express.Router();
const pool = require("../db/database");

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

router.get("/single", (req, res) => {
  res.render("layout", {
    content: "single",
  });
});

router.get("/contact", (req, res) => {
  res.render("layout", {
    content: "contact",
  });
});

router.get("/login", (req, res) => {
  res.render("login/login_layout", {
    content: "login",
  });
});

router.get("/register", (req, res) => {
  res.render("register/register_layout", {
    content: "login",
  });
});

router.get("/users-management", async (req, res) => {
  try {
    const [users] = await pool.execute('SELECT * FROM users');
  res.render("admin/admin_layout", {
    content: "users_management", users : users
  });
    }catch(err){
      console.error(error);
      res.status(500).send("Lỗi Server");
    }
});

router.get("/edit-users/:id",async (req, res) => {
  try{
    const id = req.params.id;     
    const sql = 'SELECT * FROM users WHERE id = ?';
    const [users] = await pool.execute(sql,[id]);
    res.render("admin/admin_layout", {
    content: "edit_user", users: users
});
  }catch(err){
    console.error(error);
    res.status(500).send("Lỗi Server");
  }
});

router.put("/edit-user/:id",async (req,res)=>{
    try {
    const userId = req.params.id;
    const sql = 'DELETE FROM users WHERE id = ?'
    const [result] = await pool.execute(sql,[userId]);
    if(result.affectedRows > 0) return res.json({success: true , message: 'Xóa thành công'})
    else return res.json({success: false , message: 'Xóa không thành công'})
    }catch(err){
      console.error(error);
      res.status(500).send("Lỗi Server");
    }
})

router.delete("/users-management/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const sql = 'DELETE FROM users WHERE id = ?'
    const [result] = await pool.execute(sql,[userId]);
    if(result.affectedRows > 0) return res.json({success: true , message: 'Xóa thành công'})
    else return res.json({success: false , message: 'Xóa không thành công'})
    }catch(err){
      console.error(error);
      res.status(500).send("Lỗi Server");
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const sql = "SELECT * FROM users WHERE username=? AND password=?";
        
        const [rows] = await pool.execute(sql, [username, password]);
        if (rows.length > 0) {
          if(rows[0].isAdmin === 1){
              return res.redirect('/users-management')
          }
        }
    } catch (error) {
        console.error("Lỗi Database: ", error);
        res.status(500).send("Có lỗi xảy ra phía Server!");
    }
});
module.exports = router;
