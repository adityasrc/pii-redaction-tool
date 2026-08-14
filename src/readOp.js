const mammoth = require("mammoth");

// async function readFiles() {
//   const redacted = await mammoth.extractRawText({
//     path: "../output/redacted.docx"
//   });

//   console.log("This is redacted one");
//   console.log(redacted.value.slice(0, 5000));

//   const original = await mammoth.extractRawText({
//     path: "../input/original.docx"
//   });

//   console.log("\nThis is original one");
//   console.log(original.value.slice(0, 5000));
// }

// readFiles();

mammoth.extractRawText({
  path: "../output/redacted-plain.docx",
})
.then((result) => {
  console.log(result.value.slice(0, 5000));
});