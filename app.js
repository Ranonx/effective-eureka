const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { processPDF } = require("./pdfProcessor");

const app = express();
const upload = multer({ dest: "uploads/" });

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", upload.single("pdf"), async (req, res) => {
  const pdfPath = req.file.path;
  const data = await processPDF(pdfPath);
  fs.unlinkSync(pdfPath); // Delete the uploaded file
  res.render("table", { data: data });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
