const mammoth = require("mammoth");
const { faker } = require("@faker-js/faker");
const nlp = require("compromise");
const fs = require("fs");

function createRandomMail() {
  return faker.internet.email();
}

function createRandomPhone() {
  return `+91 ${faker.string.numeric(10)}`;
}

mammoth
  .extractRawText({ path: "../input/original.docx" })
  // .then(function(result){
  //     let res = result.value;
  //     console.log(res);
  // })
  .then((result) => {
    let originalText = result.value;
    let res = originalText;

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g; // g - flag for multiple output
    const emails = res.match(emailRegex) || [];

    // Remove duplicate emails
    const uniqueEmails = new Set(emails);
    // Real email -> Fake email
    const emailMap = new Map();

    // console.log(faker.helpers.multiple(createRandomMail, { count: 5}));
    uniqueEmails.forEach((mail) => {
      if (emailMap.get(mail) == null) {
        emailMap.set(mail, createRandomMail());
      }
    });

    let phRegex = /\+91(?:\s+\d+){2,3}/g;
    const phones = res.match(phRegex) || [];

    const uniquePhones = new Set(phones);

    const phMap = new Map();

    uniquePhones.forEach((phone) => {
      if (phMap.get(phone) == null) {
        phMap.set(phone, createRandomPhone());
      }
    });

    // const ipv4Regex = /(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}/g;
    // const ipArray = res.match(ipv4Regex);
    // console.log(ipArray); // no ip add is present

    let doc = nlp(res);
    let people = doc.people().json();

    // Names found by compromise NLP
    const nlpNames = new Set();

    // Words that are clearly not part of a person's name
    const invalidKeywords = [
      "PAT",
      "CAGR",
      "Margin",
      "Director",
      "Approvals",
      "Material",
      "Tax",
      "Branch",
      "Monte",
      "Office",
      "Company",
    ];

    people.forEach((person) => {
      let name = person.text;

      name = name.replace(/[,*^&.]/g, ""); // punctuation remove
      name = name.replace(/\s+/g, " "); // extra spaces remove
      name = name.trim();

      const wordCount = name.split(" ").length;

      const hasInvalidKeyword = invalidKeywords.some((keyword) =>
        name.includes(keyword),
      );

      const isValidName = /^([A-Z][A-Za-z]+\s)+[A-Z][A-Za-z]+$/.test(name);

      if (
        wordCount >= 2 &&
        wordCount <= 4 &&
        !hasInvalidKeyword &&
        isValidName &&
        res.includes(name)
      ) {
        nlpNames.add(name);
      }
    });

    const start = res.indexOf("OUR PROMOTERS:");
    const end = res.indexOf("DETAILS OF THE OFFER TO PUBLIC");

    let promotersBlock = res.slice(start, end);

    promotersBlock = promotersBlock.replace("OUR PROMOTERS:", "");
    promotersBlock = promotersBlock.replace(/\n/g, " "); // newline -> spaces
    promotersBlock = promotersBlock.replace(/\s+/g, " "); // removing extra spaces

    let promoters = promotersBlock.split(",");
    let personPromoters = [];

    promoters.forEach((promoter) => {
      promoter = promoter.trim();
      // Trust and Limited entities are not person names
      if (!promoter.includes("TRUST") && !promoter.includes("LIMITED")) {
        personPromoters.push(promoter);
      }
    });

    const uniqueNames = new Set();

    nlpNames.forEach((name) => {
      uniqueNames.add(name);
    });

    personPromoters.forEach((name) => {
      uniqueNames.add(name);
    });

    const nameMap = new Map();

    uniqueNames.forEach((name) => {
      nameMap.set(name, faker.person.fullName());
    });

    const pinRegex = /\b[1-9]\d{2}\s?\d{3}\b/g;
    const pins = res.match(pinRegex) || [];

    const uniquePins = new Set();

    pins.forEach((pin) => {
      uniquePins.add(pin.replace(" ", ""));
    });

    const pinMap = new Map();
    uniquePins.forEach((pin) => {
      pinMap.set(pin, faker.string.numeric(6));
    });

    const cinRegex =
      /([LUu]{1})([0-9]{5})([A-Za-z]{2})([0-9]{4})([A-Za-z]{3})([0-9]{6})/g;
    const cin = res.match(cinRegex) || [];
    const uniqueCin = new Set(cin);
    const cinMap = new Map();

    uniqueCin.forEach((cinItem) => {
      cinMap.set(
        cinItem,
        faker.string.alphanumeric({
          length: cinItem.length,
          casing: "upper",
        }),
      );
    });

    const webRegex = /(?:https?:\/\/|www\.)[^\s)\],]+/g;

    const web = res.match(webRegex) || [];
    // console.log(web);

    const uniqueWeb = new Set();
    const webMap = new Map();

    web.forEach((website) => {
      let cleanWebsite = website.replace(/[.,;:]+$/, "");

      uniqueWeb.add(cleanWebsite);
    });

    uniqueWeb.forEach((website) => {
      webMap.set(website, faker.internet.url());
    });

    const sebiRegex = /\bIN[A-Z]\d{9}\b/g;
    const sebi = res.match(sebiRegex) || [];
    const uniqueSebi = new Set(sebi);
    const sebiMap = new Map();

    uniqueSebi.forEach((sebiItem) => {
      sebiMap.set(
        sebiItem,
        faker.string.alphanumeric({
          length: sebiItem.length,
          casing: "upper",
        }),
      );
    });

    const companyRegex =
      /[A-Z][A-Za-z &.,'-]+?Private Limited|[A-Z][A-Za-z &.,'-]+?Limited|[A-Z][A-Za-z &.,'-]+?LLP/g;
    const companies = res.match(companyRegex) || [];
    const uniqueCompanies = new Set();

    companies.forEach((company) => {
      company = company.trim();
      company = company
        .replace("As certified by ", "")
        .replace("Formerly ", "")
        .replace("Registered Office of our Company ", "")
        .replace("Corporate Office of our Company ", "")
        .replace("The ", "");

      if (
        company !== "Private Limited" &&
        !company.includes(",") &&
        company.split(" ").length >= 2 &&
        company.split(" ").length <= 8
      ) {
        uniqueCompanies.add(company);
      }
    });

    uniqueCompanies.delete("Wealth Management Limited");
    uniqueCompanies.delete("Securities Limited");
    uniqueCompanies.delete("Care Analytics and Advisory Private Limited");

    const companyMap = new Map();
    uniqueCompanies.forEach((company) => {
      companyMap.set(company, faker.company.name());
    });

    const chunks = originalText.split(/\n\s*\n/);

    const addressKeywords = [
      "Registered Office",
      "Corporate Office",
      "manufacturing facility",
      "Plot No.",
      "Floor",
      "Road",
      "Marg",
      "Nagar",
      "Village",
      "Tower",
      "Block",
    ];

    const pinPattern = /\b[1-9]\d{2}\s?\d{3}\b/;

    const uniqueAddresses = new Set();

    chunks.forEach((chunk) => {
      const hasPin = pinPattern.test(chunk);

      const hasKeyword = addressKeywords.some((keyword) =>
        chunk.toLowerCase().includes(keyword.toLowerCase()),
      );

      const hasOtherPII =
        /Email|Website|Telephone|Contact Person|Limited/i.test(chunk);

      const hasLongContext =
        /incorporated under|having its|located at|references to|public limited company/i.test(
          chunk,
        );

      if (
        hasPin &&
        hasKeyword &&
        !hasOtherPII &&
        !hasLongContext &&
        chunk.length < 300
      ) {
        uniqueAddresses.add(chunk.trim());
      }
    });
    const addressMap = new Map();

    uniqueAddresses.forEach((address) => {
      addressMap.set(
        address,
        faker.location.streetAddress({ useFullAddress: true }),
      );
    });

    // console.log(myMap);

    // console.log(phMap);

    // console.log(nameMap);

    // console.log(pinMap);

    // console.log(cinMap);

    // console.log(webMap);

    // console.log(sebiMap);

    // console.log(companyMap);

    // console.log(uniqueNames);

    // console.log(people);

    function replaceData(text, dataMap) {
      dataMap.forEach((fakeData, ogData) => {
        // value, key
        text = text.replaceAll(ogData, fakeData);
      });

      return text;
    }

    res = replaceData(res, emailMap);
    res = replaceData(res, phMap);
    res = replaceData(res, nameMap);
    res = replaceData(res, pinMap);
    res = replaceData(res, cinMap);
    res = replaceData(res, webMap);
    res = replaceData(res, sebiMap);
    res = replaceData(res, companyMap);
    res = replaceData(res, addressMap);

    // console.log(res.slice(0, 2000));

    // console.log(res.includes("Rajesh Kushal Hegde"));

    // console.log(
    //   "Original email exists:",
    //   res.includes("cs.connect@kshinternational.com"),
    // );

    // console.log("Original name exists:", res.includes("Rajesh Kushal Hegde"));

    // console.log(
    //   "Original company exists:",
    //   res.includes("KSH International Limited"),
    // );

    // console.log("Original SEBI exists:", res.includes("INM000013004"));

    // const originalsRemaining = [];

    // [
    //   emailMap,
    //   phMap,
    //   nameMap,
    //   pinMap,
    //   cinMap,
    //   webMap,
    //   sebiMap,
    //   companyMap,
    //   addressMap,
    // ].forEach((dataMap) => {
    //   dataMap.forEach((fakeData, originalData) => {
    //     if (res.includes(originalData)) {
    //       originalsRemaining.push(originalData);
    //     }
    //   });
    // });

    // console.log("Original data still remaining:");
    // console.log(originalsRemaining);

    // fs.writeFileSync("../output/redacted.txt", res);

    // console.log("Redacted file saved successfully");
  })
  .catch(function (error) {
    console.log("Failed to extract data");
    console.log(error);
  });
