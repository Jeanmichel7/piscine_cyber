import fs from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
// import Jimp from 'jimp';
import { ExifTool } from 'exiftool-vendored';

const argv = yargs(hideBin(process.argv)).argv;
console.log(argv)

const exiftool = new ExifTool();
async function main() {
  if (argv._.length === 0) {
    console.error('No image specified.');
    process.exit(1);
  }

  if (argv._.length > 2) {
    console.error('So many args.');
    process.exit(1);
  }

  let imageFile = argv._[0];
  if (!fs.existsSync(imageFile)) {
    console.error(`File ${imageFile} does not exist.`);
    process.exit(1);
  }

  console.log(`Processing ${imageFile}...`);

  try {
    const metadata = await exiftool.read(imageFile);
    // console.log(metadata);


    if(argv._.length === 2) {
      let metadataFile = argv._[1];
      if (!fs.existsSync(metadataFile)) {
        fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
        console.log(`Metadata saved to ${metadata}`);
      }
    }
    else {
      console.log(metadata);
    }

  } catch (err) {
    console.error(`Error processing ${imageFile}: ${err}`);
  }
  exiftool.end();
}

main();