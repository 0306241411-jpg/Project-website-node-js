const express = require("express");
const app = express();
const PORT = process.env.PORT || 3080;
const use_module = require("./routes/home");
const pool = require("./config/database");

// --- 1. CẤU HÌNH CƠ BẢN ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static("public"));

// --- 2. MIDDLEWARE LẤY FOOTER (BẮT BUỘC ĐẶT TRƯỚC ROUTER) ---
app.use(async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM website_info LIMIT 1");
    res.locals.footer = rows[0] || {
      twitter_url: "#",
      facebook_url: "#",
      linkedin_url: "#",
      instagram_url: "#",
      youtube_url: "#",
    };
    next();
  } catch (error) {
    console.error("Lỗi lấy dữ liệu Footer:", error.message);
    res.locals.footer = {
      twitter_url: "#",
      facebook_url: "#",
      linkedin_url: "#",
      instagram_url: "#",
      youtube_url: "#",
    };
    next();
  }
});

// --- 3. ĐỊNH TUYẾN ROUTER (BẮT BUỘC ĐẶT SAU MIDDLEWARE) ---
app.use("/", use_module);

// --- 4. CHẠY SERVER ---
app.listen(PORT, () => {
  console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});
