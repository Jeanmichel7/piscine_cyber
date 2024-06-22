import yargs from "yargs";

import { initRequest, initArchive } from "./file.js";
import { tester } from "./peppeteer/peppeteer.js";

const argv = yargs(process.argv.slice(2))
  .usage(" ./vaccine [--help] [--version] [-oX] URL")
  .option("o", {
    describe:
      "Archive file, if not specified it will be stored in a default one",
    type: "string",
  })
  .option("X", {
    describe: "Type of request, if not specified GET will be used",
    type: "POST | GET",
  })
  .help()
  .version()
  .alias("help", "h")
  .check((argv) => {
    if (argv._.length !== 1) {
      throw new Error("You must specify a URL");
    }
    if (new URL(argv._[0])) return true;
  }).argv;

const myscript = () => {
  initArchive(argv);
  initRequest(argv);
  const url = argv._[0];

  tester(url, argv);
};

myscript();
