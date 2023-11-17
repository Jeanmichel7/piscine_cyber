import yargs from "yargs";
import * as fs from "fs";
import axios from "axios";
import puppeteer from "puppeteer";

const payloads = [
  "SELECT * FROM users",
  "SELECT * FROM users WHERE id = 1",
  "SELECT * FROM users WHERE id = 1 AND name = 'admin'",
  "SELECT * FROM users WHERE id = 1 OR 1=1",
  "http://localhost:3000/mysql/users/1%20ORDER%20BY%203--",
];

const argv: any = yargs(process.argv.slice(2))
  .usage("--help | --version | --reverse <key> | --silent")
  .option("o", {
    describe:
      "Archive file, if not specified it will be stored in a default one",
    type: "string",
  })
  .option("X", {
    describe: "Type of request, if not specified GET will be used",
    type: "string",
  })
  .help()
  .version()
  .alias("help", "h").argv;

const initArchive = () => {
  let archivePath = "archive.txt";
  if (argv.o) archivePath = argv.o;

  if (!fs.existsSync(archivePath)) {
    fs.writeFileSync("archives/" + archivePath, "");
  }
};

const initRequest = () => {
  let requestType = "GET";
  if (argv.X) requestType = argv.X;
};

const interactWithPage = async (url: string) => {
  // const browser = await puppeteer.launch();
  // const page = await browser.newPage();
  // console.log("page: ", page);
  // console.log("url: ", url);
  // await page.goto(url);
  // const html = await page.content();
  // console.log(html);
  // await browser.close();
};

// const testVulnerabilite = (urls: string[]) => {
//   urls.forEach((url) => {
//     try {
//       payloads.forEach(async (payload) => {
//         const response = await axios.get(url + payload);
//         console.log(response.data);
//       });
//     } catch (e) {
//       console.log("error: ", e);
//     }
//   });
// };

const myscript = () => {
  initArchive();
  initRequest();
  const urls: string[] = argv._;
  console.log(urls);

  interactWithPage(urls[0]);
  // testVulnerabilite(urls);
};

myscript();
