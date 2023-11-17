import { launch } from "puppeteer";
import { saveInFile } from "../file.js";
import {
  formsFound,
  testPostVulnerabilite,
  getPostDbEngine,
  dbPostGetTables,
  dbPostGetColumns,
  dbPostDump,
} from "./postMethod.js";
import {
  testVulnerabilite,
  getDbEngine,
  dbGetTables,
  dbGetColumns,
  getParams,
  dbGetDump,
} from "./getMethod.js";

const dbData = {
  dbEngine: "",
  dbName: "",
  table: [],
  columns: [],
  nbColumns: 0,
  rows: [],
  vulnerableParameters: [],
  payloadsUsed: [],
};

const tester = async (url, argv) => {
  const requestType = argv.X ? argv.X : "GET";
  saveInFile("Request type: " + requestType);

  // try {
  //   const test = new URL(argv._[0]);
  //   console.log("test", test);
  // } catch (e) {
  //   console.log("Error: Invalid URL");
  //   process.exit(1);
  // }

  const browser = await launch({
    headless: "false",
  });
  const page = await browser.newPage();
  // page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

  if (!argv.X || argv.X === "GET") {
    // console.log('Request type: "GET"');

    const isVuln = await testVulnerabilite(argv._[0], page, dbData);
    if (!isVuln) {
      console.log("No SQL injection vulnerability found");
      process.exit(0);
    }
    await getParams(page, dbData);
    await getDbEngine(page, dbData);
    await dbGetTables(page, dbData);
    await dbGetColumns(page, dbData);
    await dbGetDump(page, dbData);

    console.log("\n\n" + dbData + "\n\n");
  } else if (argv.X === "POST") {
    await page.goto(url);
    const forms = await formsFound(page);
    await testPostVulnerabilite(page, forms, dbData);
    await getPostDbEngine(page, forms, dbData);
    await dbPostGetTables(page, forms, dbData);
    await dbPostGetColumns(page, forms, dbData);
    await dbPostDump(page, forms, dbData);

    console.log("\n\n" + dbData + "\n\n");
  } else {
    console.log("Error: Invalid request type");
    process.exit(1);
  }

  await browser.close();
  saveInFile(dbData);
};

export { tester };
