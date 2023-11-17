import fs from "fs";

let archivePath = "../archives/archive.txt";

const initArchive = (argv) => {
  if (argv.o) archivePath = argv.o;

  if (!fs.existsSync(archivePath)) {
    fs.writeFileSync("../archives/" + archivePath, "");
  }
  fs.appendFileSync(
    "../archives/" + archivePath,
    "\n\n\nTest URL : " + argv._[0] + "\n"
  );
};

const initRequest = (argv) => {
  let requestType = "GET";
  if (argv.X) requestType = argv.X;
};

const saveInFile = (data) => {
  const jsonData = JSON.stringify(data, null, 2);
  fs.appendFileSync("../archives/" + archivePath, jsonData + "\n");
};

export { initArchive, initRequest, saveInFile };
