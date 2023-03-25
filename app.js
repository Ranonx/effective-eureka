const express = require("express");
const multer = require("multer");
const fs = require("fs");
const mysql = require("mysql");
const pdf = require("pdf-parse");

const app = express();
const upload = multer({ dest: "uploads/" });

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index");
});

function extractFootData(data) {
  const content = fs.readFileSync(data);
  return pdf(content, { max: 1 }).then((data) => {
    const text = data.text.split("\n");

    let index = text.findIndex((line) => line.includes("足部分析报告"));
    if (index > 1) {
      text.splice(0, index - 1);
    }
    const enumeratedText = text
      .map((line, index) => `${index}: ${line}`)
      .join("\n");

    console.log(enumeratedText);
    // Use regular expressions to extract foot data from the text
    const shoeSizeRegex = /鞋码(\d{2})(\d{2})/;
    const match = text[9].match(shoeSizeRegex);

    let shoeSizeLeft, shoeSizeRight;
    if (match) {
      shoeSizeLeft = parseInt(match[1], 10);
      shoeSizeRight = parseInt(match[2], 10);
    } else {
      shoeSizeLeft = NaN;
      shoeSizeRight = NaN;
    }
    console.log(`shoeSizeLeft: ${shoeSizeLeft}`);

    const footData = {
      id_num: text[5],
      name: text[6],
      gender: text[7],
      shoe_size_left: shoeSizeLeft,
      shoe_size_right: shoeSizeRight,
      arch_length_left: parseFloat(text[31]),
      arch_length_right: parseFloat(text[32]),
      arch_width_left: parseFloat(text[33]),
      arch_width_right: parseFloat(text[34]),
      heel_width_left: parseFloat(text[35]),
      heel_width_right: parseFloat(text[36]),
      foot_length_left: parseFloat(text[37]),
      foot_length_right: parseFloat(text[38]),
      foot_width_left: parseFloat(text[39]),
      foot_width_right: parseFloat(text[40]),
      ball_girth_left: parseInt(text[41], 10),
      ball_girth_right: parseInt(text[42], 10),
      arch_index_left: parseFloat(text[43]),
      arch_index_right: parseFloat(text[44]),
      arch_ratio_left: parseFloat(text[45]),
      arch_ratio_right: parseFloat(text[46]),
    };
    return footData;
  });
}
async function processPDFs(pdfPaths) {
  const footDataArray = [];
  for (const pdfPath of pdfPaths) {
    const footData = await extractFootData(pdfPath);
    footDataArray.push(footData);
  }
  console.log(footDataArray);
  return Promise.all(footDataArray);
}

app.post("/upload", upload.array("pdf"), async (req, res) => {
  const pdfPaths = req.files.map((file) => file.path);
  console.log(`pdfPaths: ${pdfPaths}`);

  const footDataArray = await processPDFs(pdfPaths);
  console.log(`footDataArray: ${footDataArray}`);
  for (const pdfPath of pdfPaths) {
    fs.unlinkSync(pdfPath); // Delete the uploaded files
  }

  res.render("table", { footDataArray }, (err, html) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error rendering table");
    } else {
      res.send(html);
    }
  });
});

app.post("/insert", async (req, res) => {
  const footDataArray = req.body;
  console.log(`recieved footDataArray: ${footDataArray}`);
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

  footDataArray.forEach((footData) => {
    connection.query(
      query,
      Object.values(footData),
      (error, results, fields) => {
        if (error) {
          console.error(error);
          res.status(500).send("Error inserting data");
        }
      }
    );
  });

  res.status(200).send("Data inserted successfully");
  connection.end();
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
