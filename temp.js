const fs = require("fs");
const PizZip = require("pizzip");

function check(file, text) {
  const content = fs.readFileSync(file, "binary");
  const zip = new PizZip(content);
  const xml = zip.files["word/document.xml"].asText();

  const index = xml.indexOf(text);

  console.log(file, index);

  if (index !== -1) {
    console.log(xml.slice(index - 200, index + text.length + 200));
  }
}

const text =
  "11/3, 11/4 and 11/5 Village Birdewadi Chakan Taluka - Khed Pune – 410 501";

check("../input/original.docx", text);
check("../output/redacted.docx", text);