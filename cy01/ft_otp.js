import fs from "fs";
import yargs from "yargs";
import crypto from "crypto";
// var hotp = require( 'hotp' )
import hotp from 'hotp';
let counter = 0


const argv = yargs(process.argv.slice(2))
  .usage("-g <key file> | -k <key file>")
  .option("g", {
    alias: "generate",
    describe: "Generate key file",
    type: "string",
  })
  .option("k", {
    alias: "key",
    describe: "Generate OTP",
    type: "string",
  })
  .help()
  .alias("help", "h").argv;
// console.log(argv)

class Crypto {
  #publicKeyPath = "crypto/public_key.pem";
  #privateKeyPath = "crypto/private_key.pem";

  constructor() {
    this.#initKeys();
  }

  #initKeys() {
    if (
      !fs.existsSync(this.#publicKeyPath) ||
      !fs.existsSync(this.#privateKeyPath)
    ) {
      console.log("init private/public keys to encrypt/decrypt file");
      const keyPair = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
        },
      });
      fs.writeFileSync(this.#publicKeyPath, keyPair.publicKey);
      fs.writeFileSync(this.#privateKeyPath, keyPair.privateKey);
    }
  }
  getPublicKey() {
    return fs.readFileSync(this.#publicKeyPath, "utf8");
  }
  getPrivateKey() {
    return fs.readFileSync(this.#privateKeyPath, "utf8");
  }
}
// console.log(chiffrement.getPrivateKey())

// HOTP generation
// function generateTOTP(secret) {
//   const hmac = crypto.createHmac("sha1", Buffer.from(secret, "hex"));
//   const counter = Math.floor(Date.now() / 1000 / 30); // 30s
//   hmac.update(Buffer.from(counter.toString(16).padStart(16, "0"), "hex"));

//   const hmacResult = hmac.digest();
//   const offset = hmacResult[hmacResult.length - 1] & 0xf;
//   const binaryCode =
//     ((hmacResult[offset] & 0x7f) << 24) |
//     ((hmacResult[offset + 1] & 0xff) << 16) |
//     ((hmacResult[offset + 2] & 0xff) << 8) |
//     (hmacResult[offset + 3] & 0xff);

//   return (binaryCode % Math.pow(10, 6)).toString().padStart(6, "0");
// }


function generateHTOP(secret, counter){
  var token = hotp( secret, counter, { digits: 6 })
  counter += 1
  return token;
}

function generateTemporyPass(secret, counter) {
  var token = hotp( secret, counter, { digits: 6 })
  counter += 1
  // trasform token HOTP in TOTP

  const time = Math.floor(Date.now() / 1000 / 30); // 30s



  return token;

}

const chiffrement = new Crypto();
if (argv.g) {
  const keyFile = fs.readFileSync(argv.g, "utf-8");
  if (keyFile.length !== 64 || !/^[0-9a-f]+$/i.test(keyFile)) {
    console.error("Key must be 64 hexadecimal characters.");
    process.exit(1);
  }
  const buffer = Buffer.from(keyFile);
  const encrypted = crypto.publicEncrypt(
    {
      key: chiffrement.getPublicKey(),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    buffer
  );
  const encryptedKey = encrypted.toString("base64");
  fs.writeFileSync("ft_otp.key", encryptedKey);
}

else if (argv.k) {
  const encryptedKey = fs.readFileSync(argv.k, "utf-8");
  const buffer = Buffer.from(encryptedKey, "base64");
  const decrypted = crypto.privateDecrypt(
    {
      key: chiffrement.getPrivateKey(),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    buffer
  );

  const secretKey = decrypted.toString("utf8");
  console.log(generateTemporyPass(secretKey, counter));
  console.log(counter)
} else {
  console.error("No arguments provided.");
  process.exit(1);
}
