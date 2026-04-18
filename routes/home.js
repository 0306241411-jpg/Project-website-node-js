const express = require("express");
const router = express.Router();
const pool = require("../db/database");
const multer = require("multer");
const path = require("path");

router.use(express.json());

// ==============================================
// 0. CẤU HÌNH MULTER (LƯU ẢNH BÌNH LUẬN)
// ==============================================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// ==============================================
// 1. GIAO DIỆN NGƯỜI DÙNG & BÀI VIẾT (CỦA CODE 1)
// ==============================================

// Trang chủ (Có load bài viết)
router.get("/", async (req, res) => {
    try {
        const sql = "SELECT * FROM posts ORDER BY id DESC";
        const [posts] = await pool.execute(sql);
        res.render("layout", { content: "index", posts: posts });
    } catch (err) {
        console.error("Lỗi:", err);
        res.status(500).send("Lỗi Server");
    }
});

router.get("/category", (req, res) => res.render("layout", { content: "category" }));
router.get("/contact", (req, res) => res.render("layout", { content: "contact" }));

// Chi tiết bài viết & Bình luận (Có ID)
router.get("/single/:id", async (req, res) => {
    try {
        const postId = req.params.id;
        const [posts] = await pool.execute("SELECT * FROM posts WHERE id = ?", [postId]);
        const [comments] = await pool.execute("SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC", [postId]);

        if (posts.length > 0) {
            res.render("layout", { content: "single", post: posts[0], comments: comments });
        } else {
            res.status(404).send("Không tìm thấy bài viết!");
        }
    } catch (err) {
        res.status(500).send("Lỗi Server");
    }
});

// Xử lý Gửi bình luận (Có up ảnh)
router.post("/single", upload.single('comment_image'), async (req, res) => {
    try {
        const { post_id, name, email, content } = req.body;
        const image = req.file ? req.file.filename : null;
        const sql = "INSERT INTO comments (post_id, name, email, content, image) VALUES (?, ?, ?, ?, ?)";
        await pool.execute(sql, [post_id, name, email, content, image]);
        res.redirect(`/single/${post_id}`); 
    } catch (err) {
        res.status(500).send("Lỗi Server khi gửi bình luận");
    }
});

// ==============================================
// 2. TÍNH NĂNG ĐĂNG NHẬP & ADMIN (CỦA CODE 2 GIỮ NGUYÊN)
// ==============================================

router.get("/login", (req, res) => res.render("login/login_layout", { content: "login" }));
router.get("/dang-xuat", (req, res) => res.redirect("/login"));

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username.endsWith("@gmail.com")) {
            return res.status(500).send("Lỗi: Tên đăng nhập bắt buộc phải là tài khoản @gmail.com!");
        }
        const sql = "SELECT * FROM users WHERE username=? AND password=?";
        const [rows] = await pool.execute(sql, [username, password]);

        if (rows.length > 0) {
            if (rows[0].username == "admin@gmail.com") return res.redirect("/users_management");
            else return res.redirect("/");
        } else {
            return res.status(401).send("Sai tên đăng nhập hoặc mật khẩu!");
        }
    } catch (error) {
        res.status(500).send("Có lỗi xảy ra phía Server!");
    }
});

router.get("/users_management", async (req, res) => {
    try {
        const [users] = await pool.execute("SELECT * FROM users");
        res.render("admin/admin_layout", { content: "users_management", users: users });
    } catch (err) {
        res.status(500).send("Lỗi Server");
    }
});

router.get("/edit-users/:id", async (req, res) => {
    try {
        const [users] = await pool.execute("SELECT * FROM users WHERE id = ?", [req.params.id]);
        res.render("admin/admin_layout", { content: "edit_user", users: users });
    } catch (err) {
        res.status(500).send("Lỗi Server");
    }
});

router.put("/edit-user/:id", async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const sql = "UPDATE users SET username=?, password=?, isAdmin=? WHERE id=?";
        const [result] = await pool.execute(sql, [username, password, role, req.params.id]);
        if (result.affectedRows > 0) return res.json({ success: true });
        else return res.json({ success: false, message: "Không tìm thấy User" });
    } catch (err) {
        res.status(500).send("Lỗi Server");
    }
});

router.put("/users_management/:id", async (req, res) => {
    try {
        const sql = "UPDATE users SET password = 123 WHERE id = ?";
        const [result] = await pool.execute(sql, [req.params.id]);
        if (result.affectedRows > 0) return res.json({ success: true });
        else return res.json({ success: false, message: "Không tìm thấy user" });
    } catch (err) {
        res.status(500).send("Lỗi Server");
    }
});

router.delete("/users_management/:id", async (req, res) => {
    try {
        const sql = "DELETE FROM users WHERE id = ?";
        const [result] = await pool.execute(sql, [req.params.id]);
        if (result.affectedRows > 0) return res.json({ success: true, message: "Xóa thành công" });
        else return res.json({ success: false, message: "Xóa không thành công" });
    } catch (err) {
        res.status(500).send("Lỗi Server");
    }
});

module.exports = router;