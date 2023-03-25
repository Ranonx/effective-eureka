const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { processPDF, extractFootData } = require("./pdfProcessor");
const mysql = require("mysql");

const app = express();
const upload = multer({ dest: "uploads/" });

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", upload.single("pdf"), async (req, res) => {
  const pdfPath = req.file.path;
  const data = await processPDF(pdfPath);
  const footData = extractFootData(data);
  fs.unlinkSync(pdfPath); // Delete the uploaded file
  res.render("table", { footData }, (err, html) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error rendering table");
    } else {
      res.send(html);
    }
  });
});

app.post("/insert", async (req, res) => {
  const footData = req.body;
  console.log(`recieved footData: ${footData}`);
  const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Rc19931020",
    database: "unisole",
  });

  connection.connect();

  const query = `
    INSERT INTO foot_data (id_num, name, gender, shoe_size_left, shoe_size_right,
      arch_length_left, arch_length_right, arch_width_left, arch_width_right, heel_width_left, heel_width_right,
      foot_length_left, foot_length_right, foot_width_left, foot_width_right, ball_girth_left, ball_girth_right,
      arch_index_left, arch_index_right, arch_ratio_left, arch_ratio_right)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(query, Object.values(footData), (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send("Error inserting data");
    } else {
      res.status(200).send("Data inserted successfully");
    }
  });

  connection.end();
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
