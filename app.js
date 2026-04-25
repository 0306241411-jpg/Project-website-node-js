const express = require("express");
const app = express();
const PORT = process.env.PORT || 3080;
const use_module = require("./routes/home");
app.use(express.urlencoded({extended : true}));
app.use(express.json());

app.set("view engine", "ejs");
app.use(express.static("public"));


app.use("/", use_module);

app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
});
