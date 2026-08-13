const fs = require("fs");
const pizzip = require("pizzip");

function createRedactedDocx(maps, nameMap) {
  const input = "../input/original.docx";
  const output = "../output/redacted.docx";

  const content = fs.readFileSync(input, "binary");
  const zip = new pizzip(content);

  let xml = zip.files["word/document.xml"].asText();

  // Names are replaced case-insensitively
  nameMap.forEach((fakeName, realName) => {
    const regex = new RegExp(realName, "gi");
    xml = xml.replace(regex, fakeName);
  });

  // Other Pii
  maps.forEach((dataMap) => {
    dataMap.forEach((fakeData, originalData) => {
      xml = xml.replaceAll(originalData, fakeData);
    });
  });

  zip.file("word/document.xml", xml);

  const outputFile = zip.generate({
    type: "nodebuffer",
  });

  fs.writeFileSync(output, outputFile);

  console.log("Redacted DOCX created");
}

module.exports = createRedactedDocx;