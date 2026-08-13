const fs = require("fs");
const { Document, Packer, Paragraph } = require("docx");

function createPlainDocx(text, maps, nameMap) {
  // Replace names
  nameMap.forEach((fakeName, realName) => {
    const regex = new RegExp(realName, "gi");
    text = text.replace(regex, fakeName);
  });

  // Replace all other PII
  maps.forEach((dataMap) => {
    dataMap.forEach((fakeData, originalData) => {
      text = text.replaceAll(originalData, fakeData);
    });
  });

  const lines = text.split("\n");

  const children = lines.map((line) => {
    return new Paragraph(line);
  });

  const doc = new Document({
    sections: [
      {
        children: children,
      },
    ],
  });

  Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("../output/redacted-plain.docx", buffer);
    console.log("Plain redacted DOCX created");
  });
}

module.exports = createPlainDocx;