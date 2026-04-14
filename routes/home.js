const express = require("express");
const router = express.Router();

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

module.exports = router;
