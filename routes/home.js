const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const multer = require("multer");
const path = require("path");

router.use(express.json());

// ==============================================
// 0. CẤU HÌNH MULTER (LƯU ẢNH BÌNH LUẬN)
// ==============================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
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

// ==========================================
// QUẢN LÝ CHỦ ĐỀ (DANH MỤC)
// ==========================================

// 1. Hiển thị danh sách chủ đề
router.get("/admin/categories", async (req, res) => {
  try {
    const [categories] = await pool.query(
      "SELECT * FROM categories ORDER BY id DESC",
    );

    // CHÚ Ý CHỖ NÀY: Phải gọi admin_layout, và truyền content là category_list
    res.render("admin/admin_layout", {
      content: "category_list",
      categories: categories,
    });
  } catch (err) {
    console.log(err);
    res.send("Lỗi load danh mục");
  }
});

// 2. Xử lý Thêm chủ đề mới (Khi bấm nút Lưu Chủ Đề)
router.post("/admin/categories/add", async (req, res) => {
  try {
    const { name } = req.body;
    await pool.query("INSERT INTO categories (name) VALUES (?)", [name]);
    res.redirect("/admin/categories"); // Thêm xong load lại trang
  } catch (err) {
    console.log(err);
    res.send("Lỗi thêm chủ đề");
  }
});

// 3. Cập nhật (Sửa) chủ đề
router.post("/admin/categories/edit/:id", async (req, res) => {
  try {
    const { name } = req.body;
    await pool.query("UPDATE categories SET name = ? WHERE id = ?", [
      name,
      req.params.id,
    ]);
    res.redirect("/admin/categories");
  } catch (err) {
    console.log(err);
    res.send("Lỗi sửa chủ đề");
  }
});

// 4. Xóa chủ đề
router.get("/admin/categories/delete/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM categories WHERE id = ?", [req.params.id]);
    res.redirect("/admin/categories");
  } catch (err) {
    console.log(err);
    res.send(
      "Lỗi xóa chủ đề (Có thể do chủ đề này đang chứa bài viết, cần xóa bài viết trước)",
    );
  }
});

router.get("/contact", (req, res) =>
  res.render("layout", { content: "contact" }),
);

// Chi tiết bài viết & Bình luận (Có ID)
router.get("/single/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const [posts] = await pool.execute("SELECT * FROM posts WHERE id = ?", [
      postId,
    ]);
    const [comments] = await pool.execute(
      "SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC",
      [postId],
    );

    if (posts.length > 0) {
      res.render("layout", {
        content: "single",
        post: posts[0],
        comments: comments,
      });
    } else {
      res.status(404).send("Không tìm thấy bài viết!");
    }
  } catch (err) {
    res.status(500).send("Lỗi Server");
  }
});

// Xử lý Gửi bình luận (Có up ảnh)
router.post("/single", upload.single("comment_image"), async (req, res) => {
  try {
    const { post_id, name, email, content } = req.body;
    const image = req.file ? req.file.filename : null;
    const sql =
      "INSERT INTO comments (post_id, name, email, content, image) VALUES (?, ?, ?, ?, ?)";
    await pool.execute(sql, [post_id, name, email, content, image]);
    res.redirect(`/single/${post_id}`);
  } catch (err) {
    res.status(500).send("Lỗi Server khi gửi bình luận");
  }
});

//nút kết nối trang category.ejs
router.get("/category", (req, res) =>
  res.render("layout", { content: "category" }),
);

// ==============================================
// 2. TÍNH NĂNG ĐĂNG NHẬP & ADMIN (CỦA CODE 2 GIỮ NGUYÊN)
// ==============================================

router.get("/login", (req, res) =>
  res.render("login/login_layout", { content: "login" }),
);
router.get("/dang-xuat", (req, res) => res.redirect("/login"));

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username.endsWith("@gmail.com")) {
      return res
        .status(500)
        .send("Lỗi: Tên đăng nhập bắt buộc phải là tài khoản @gmail.com!");
    }
    const sql = "SELECT * FROM users WHERE username=? AND password=?";
    const [rows] = await pool.execute(sql, [username, password]);

    if (rows.length > 0) {
      if (rows[0].isAdmin === 1) return res.redirect("/admin/users_management");
      else return res.redirect("/");
    } else {
      return res.status(401).send("Sai tên đăng nhập hoặc mật khẩu!");
    }
  } catch (error) {
    res.status(500).send("Có lỗi xảy ra phía Server!");
  }
});

router.get("/admin/users_management", async (req, res) => {
  try {
    const [users] = await pool.execute("SELECT * FROM users WHERE isAdmin=0");
    res.render("admin/admin_layout", {
      content: "users_management",
      users: users,
    });
  } catch (err) {
    res.status(500).send("Lỗi Server");
  }
});

router.get("/admin/edit_users/:id", async (req, res) => {
  try {
    const [users] = await pool.execute("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);
    res.render("admin/admin_layout", { content: "edit_user", users: users });
  } catch (err) {
    res.status(500).send("Lỗi Server");
  }
});

router.put("/admin/edit_user/:id", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const sql = "UPDATE users SET username=?, password=?, isAdmin=? WHERE id=?";
    const [result] = await pool.execute(sql, [
      username,
      password,
      role,
      req.params.id,
    ]);
    if (result.affectedRows > 0) return res.json({ success: true });
    else return res.json({ success: false, message: "Không tìm thấy User" });
  } catch (err) {
    res.status(500).send("Lỗi Server");
  }
});

router.put("/admin/users_management/:id", async (req, res) => {
  try {
    const sql = "UPDATE users SET password = 1234 WHERE id = ?";
    const [result] = await pool.execute(sql, [req.params.id]);
    if (result.affectedRows > 0) return res.json({ success: true });
    else return res.json({ success: false, message: "Không tìm thấy user" });
  } catch (err) {
    res.status(500).send("Lỗi Server");
  }
});

router.delete("/admin/users_management/:id", async (req, res) => {
  try {
    const sql = "DELETE FROM users WHERE id = ?";
    const [result] = await pool.execute(sql, [req.params.id]);
    if (result.affectedRows > 0)
      return res.json({ success: true, message: "Xóa thành công" });
    else return res.json({ success: false, message: "Xóa không thành công" });
  } catch (err) {
    res.status(500).send("Lỗi Server");
  }
});

// ==========================================
// CÂU 7: QUẢN LÝ BÀI VIẾT
// ==========================================

// 1. Hiển thị, Tìm kiếm, Lọc và Phân trang
router.get("/admin/posts", async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const category_filter = req.query.category_id || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 5; // Hiển thị 5 bài trên 1 trang
    const offset = (page - 1) * limit;

    // Xây dựng câu lệnh điều kiện (WHERE)
    let whereClause = "WHERE posts.title LIKE ?";
    let queryParams = [`%${keyword}%`];

    if (category_filter) {
      whereClause += " AND posts.category_id = ?";
      queryParams.push(category_filter);
    }

    // Tính tổng số trang
    const countSql = `SELECT COUNT(*) AS total FROM posts ${whereClause}`;
    const [countResult] = await pool.query(countSql, queryParams);
    const totalPages = Math.ceil(countResult[0].total / limit);

    // Lấy dữ liệu bài viết đã phân trang
    const sqlPosts = `
            SELECT posts.*, categories.name AS category_name 
            FROM posts 
            LEFT JOIN categories ON posts.category_id = categories.id 
            ${whereClause}
            ORDER BY posts.id  
            LIMIT ? OFFSET ?
        `;
    // Query param cho LIMIT/OFFSET cần thiết lập
    const [posts] = await pool.query(sqlPosts, [...queryParams, limit, offset]);
    const [categories] = await pool.query("SELECT * FROM categories");

    // Đổ dữ liệu sang giao diện (truyền đủ tham số phân trang, tìm kiếm)
    res.render("admin/admin_layout", {
      content: "post_list",
      posts,
      categories,
      keyword,
      category_filter,
      currentPage: page,
      totalPages,
    });
  } catch (err) {
    console.log(err);
    res.send("Lỗi load danh sách bài viết");
  }
});

// 2. Thêm bài viết mới
router.post("/admin/posts/add", upload.single("image"), async (req, res) => {
  try {
    const { title, content, category_id, author, status } = req.body;
    // Nếu không chọn ảnh, gán tên ảnh mặc định hoặc để trống
    const image = req.file ? req.file.filename : "default.jpg";

    await pool.query(
      "INSERT INTO posts (title, content, image, category_id, author, status) VALUES (?, ?, ?, ?, ?, ?)",
      [
        title,
        content,
        image,
        category_id,
        author || "Admin",
        status || "Hiển thị",
      ],
    );
    res.redirect("/admin/posts");
  } catch (err) {
    console.error("LỖI SQL:", err); // In lỗi ra màn hình đen (Terminal) để kiểm tra
    res.status(500).send("Lỗi thêm bài viết: " + err.message);
  }
});

// 3. Cập nhật (Sửa) bài viết và trạng thái
router.post(
  "/admin/posts/edit/:id",
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, content, category_id, author, status } = req.body;
      const id = req.params.id;

      if (req.file) {
        // Nếu người dùng chọn ảnh mới
        const image = req.file.filename;
        await pool.query(
          "UPDATE posts SET title=?, content=?, image=?, category_id=?, author=?, status=? WHERE id=?",
          [title, content, image, category_id, author, status, id],
        );
      } else {
        // Nếu không úp ảnh mới thì giữ nguyên ảnh cũ
        await pool.query(
          "UPDATE posts SET title=?, content=?, category_id=?, author=?, status=? WHERE id=?",
          [title, content, category_id, author, status, id],
        );
      }
      res.redirect("/admin/posts");
    } catch (err) {
      console.log(err);
      res.send("Lỗi sửa bài viết");
    }
  },
);

// 4. Xóa bài viết
router.get("/admin/posts/delete/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM posts WHERE id = ?", [req.params.id]);
    res.redirect("/admin/posts");
  } catch (err) {
    console.log(err);
    res.send("Lỗi xóa bài viết");
  }
});

// ==========================================
// ĐĂNG KÝ NHẬN TIN TỨC (SUBSCRIBE)
// ==========================================
router.post("/subscribe", async (req, res) => {
  try {
    // 1. Lấy email từ form người dùng nhập
    const email = req.body.email;

    // 2. Viết câu lệnh SQL thêm vào database
    const sql = "INSERT INTO subscribers (email) VALUES (?)";

    // 3. Thực thi câu lệnh (Dùng await cho đồng bộ với các hàm trên)
    await pool.query(sql, [email]);
    console.log("Đã lưu email thành công:", email);
    // Lưu xong thì tự động load lại trang hiện tại
    res.send(`<script>
                alert("Cảm ơn bạn! Đăng ký nhận tin tức thành công."); 
                window.location.href = document.referrer;   // dùng để tải lại trang cũ
              </script>`);
  } catch (err) {
    // Nếu lỗi trùng email (mã ER_DUP_ENTRY), ta vẫn báo thành công hoặc bỏ qua
    if (err.code === "ER_DUP_ENTRY") {
      console.log("Email này đã được đăng ký.");
      return res.send(`<script>
                        alert("Email này đã được đăng ký rồi! Vui lòng dùng email khác."); 
                        window.location.href = document.referrer;    // dùng để tải lại trang cũ
                      </script>`);
    }

    console.error("Lỗi khi lưu email:", err);
    res.status(500).send("Lỗi Server khi đăng ký email");
  }
});

// ==========================================
// QUẢN LÝ NGƯỜI ĐĂNG KÝ (SUBSCRIBERS)
// ==========================================

// 1. Hiển thị danh sách email đã đăng ký
router.get("/admin/subscribers", async (req, res) => {
  try {
    // Lấy danh sách từ mới nhất đến cũ nhất
    const [subscribers] = await pool.query(
      "SELECT * FROM subscribers ORDER BY id ASC",
    );

    res.render("admin/admin_layout", {
      content: "subscriber_list", // Sẽ gọi file subscriber_list.ejs
      subscribers: subscribers,
    });
  } catch (err) {
    console.log(err);
    res.send("Lỗi load danh sách người đăng ký");
  }
});

// 2. Xóa email khỏi danh sách
router.get("/admin/subscribers/delete/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM subscribers WHERE id = ?", [req.params.id]);
    res.redirect("/admin/subscribers"); // Xóa xong thì load lại trang
  } catch (err) {
    console.log(err);
    res.send("Lỗi xóa email");
  }
});

// Thêm người dùng mới
// 1. Route để mở form thêm (Phải khớp với link ở nút bấm)
router.get("/admin/users_management/add", (req, res) => {
  res.render("admin/admin_layout", { content: "add_users" });
});

// 2. Route để xử lý khi nhấn nút "Xác nhận thêm" trên form
router.post("/admin/users_management/add", async (req, res) => {
  try {
    const { username, password } = req.body;
    await pool.execute(
      "INSERT INTO users (username, password, isAdmin) VALUES (?, ?, 0)",
      [username, password],
    );
    res.redirect("/admin/users_management"); // Thêm xong tự quay về danh sách
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi Database!");
  }
});

module.exports = router;
