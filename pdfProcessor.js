const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");
const pdfjs = require("pdfjs-dist/build/pdf");
const pdfjsWorker = require("pdfjs-dist/build/pdf.worker.entry");

async function processPDF(pdfPath) {
  // Load the PDF file
  const pdfBytes = fs.readFileSync(pdfPath);

  // Use pdfjs to extract text from the PDF
  const loadingTask = pdfjs.getDocument({ data: pdfBytes });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  const pageTextPromises = [];
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    pageTextPromises.push(
      pdf.getPage(pageNum).then(async (page) => {
        const textContent = await page.getTextContent();
        return textContent.items.map((item) => item.str).join(" ");
      })
    );
  }

  const pageTexts = await Promise.all(pageTextPromises);

  // Extract data from the PDF
  const data = pageTexts; // Array of text from each page

  return data;
}

module.exports = {
  processPDF,
};
