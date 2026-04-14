const express = require("express");
const app = express();
const PORT = process.env.PORT || 3080;
const use_module = require("./routes/home");
const bcrypt = require("bcrypt");

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use("/", use_module);

app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
  //console.log(`Admin: http://localhost:${PORT}/`);
});
