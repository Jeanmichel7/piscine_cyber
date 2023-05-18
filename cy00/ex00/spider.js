import axios from "axios";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import fs from "fs";
import path from "path";
import chalk from "chalk";

const argv = yargs(hideBin(process.argv))
  .option("r", {
    alias: "recursive",
    type: "boolean",
    description: "Download images recursively",
  })
  .option("l", {
    alias: "level",
    type: "number",
    description: "Max depth level of recursive download",
  })
  .default("l", 5)
  .option("p", {
    alias: "path",
    type: "string",
    description: "Path to save downloaded files",
  })
  .default("p", "./defaultData/").argv;
console.log(argv)


function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}

async function getAllImages(url) {
  try {
    let res = await axios.get(url);
    let urlImagesTab = res.data.match(/<img[^>]+>/g);
    if (!urlImagesTab) throw { url: url, message: "is not a valid URL" };
    urlImagesTab = urlImagesTab.map((e) => {
      let test = e.match(/src=([^ ]+)/);
      if (!test) throw { url: url, message: "is not a valid URL" };
      test = test[1].replaceAll('"', "").replaceAll("'", "");
      test = test[0] === "/" ? url + test : test;
      return test;
    })
    .filter((e) => e.split('.').pop().match(/(jpg|jpeg|png|gif|bmp)$/i));
    return urlImagesTab;
  } catch (err) {
    console.log("log get all images : ",  err.status!=200 ? (url, err.code ) : err.message);
  }
}


async function downloadImg(urlImg) {
  try{
    let img = await axios.get(urlImg, { responseType: "arraybuffer" });
    if(!img) throw { url: urlImg, message: "is not a valid URL" };
    let filename = path.basename(urlImg);
    let tmpPath = path.join(argv.p, filename);
    // console.log("path : ", tmpPath)
    let tmpNewPath = tmpPath.split('.')
    let extention = tmpNewPath[tmpNewPath.length - 1]
    tmpNewPath = tmpNewPath.slice(0, tmpNewPath.length - 1)
    let newPath = tmpNewPath + Date.now() + '_' + Math.random()*10**6 + '.' + extention

    // let hash = crypto.createHash('sha256');
    // hash.update(img.data);
    // let hashString = hash.digest('hex');
    // let fileExtension = path.extname(urlImg);
    // let newPath = path.join(argv.p, `${hashString}${fileExtension}`);
    
    // console.log("newPath : ", newPath)
    fs.writeFileSync(newPath, img.data);
    if (fs.existsSync(newPath)) {
      console.log(chalk.green(`Downloaded ${filename} \nfrom ${urlImg}`));
    }
  } catch (err) {
    console.log("log download images : ", err.status!=200 ? (urlImg, err.code ) : err.message);
    return;
  }
}

async function getAllLinks(url) {
  try {
    let res = await axios.get(url);
    let urlTab = res.data.match(/<a [^>]+>/g);
    if (!urlTab ) throw ("aucun lien sur la page");
    urlTab = urlTab.map((e) => {
      let test = e.match(/href=([^ >]+)/);
      if (!test) throw  ("balise a sans href", test);
      test = test[1].replaceAll('"', "").replaceAll("'", "");
      test = test[0] === "/" ? url + test : test;
      return test;
    })
    .filter((e) => isValidURL(e));
    return urlTab;
  } catch (err) {
    console.log("log get all links : ",  err?.status!=200 ? (url, err?.code ) : err.message);
    return;
  }
}

async function main(url, level) {
  if(url === undefined) return console.error("url is undefined");
  if (level < 0) return;
  if (!fs.existsSync(argv.p)) {
    fs.mkdirSync(argv.p);
  }

  let tabImgUrl = await getAllImages(url)
  if(tabImgUrl && tabImgUrl.length > 0){
    Promise.all(tabImgUrl.map(async (urlImg) => {
      console.log("lvl:"+ level + ", urlImg : ", urlImg);
      await downloadImg(urlImg);
    }));
  }

  if (argv.r) {
    let urlTab = await getAllLinks(url);
    if(urlTab && urlTab.length > 0) {
      urlTab.map((url) => {
        console.log("lvl:"+ level + ",link : ", url)
        main(url, level - 1);
      });
    }
  }
}

main(argv._[0], argv.l);
