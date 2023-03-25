const fs = require("fs");
const path = require("path");
const pdfjs = require("pdfjs-dist/build/pdf");

function extractFootData(data) {
  const footData = {
    id_num: data[10],
    name: data[11],
    gender: data[12],
    shoe_size_left: parseInt(data[18], 10),
    shoe_size_right: parseInt(data[19], 10),
    arch_length_left: parseFloat(data[53]),
    arch_length_right: parseFloat(data[54]),
    arch_width_left: parseFloat(data[55]),
    arch_width_right: parseFloat(data[56]),
    heel_width_left: parseFloat(data[57]),
    heel_width_right: parseFloat(data[58]),
    foot_length_left: parseFloat(data[59]),
    foot_length_right: parseFloat(data[60]),
    foot_width_left: parseFloat(data[61]),
    foot_width_right: parseFloat(data[62]),
    ball_girth_left: parseInt(data[63], 10),
    ball_girth_right: parseInt(data[64], 10),
    arch_index_left: parseFloat(data[65]),
    arch_index_right: parseFloat(data[66]),
    arch_ratio_left: parseFloat(data[67]),
    arch_ratio_right: parseFloat(data[68]),
  };

  return footData;
}

async function processPDF(pdfPath) {
  // Load the PDF file
  const pdfBytes = fs.readFileSync(pdfPath);

  // Use pdfjs to extract text from the PDF
  const loadingTask = pdfjs.getDocument({ data: pdfBytes });
  const pdf = await loadingTask.promise;

  // Get the first page
  const firstPage = await pdf.getPage(1);
  const textContent = await firstPage.getTextContent();
  const pageText = textContent.items.map((item) => item.str).join(" ");

  // Extract data from the PDF
  const dataArray = pageText.split(/\s+/); // Split the text by whitespace and line breaks

  // Log the extracted data
  dataArray.forEach((item, index) => {
    // console.log(`${index}: ${item}`);
  });

  return dataArray;
}

module.exports = {
  processPDF,
  extractFootData,
};
