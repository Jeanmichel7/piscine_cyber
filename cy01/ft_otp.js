import fs from "fs";
import yargs from "yargs";
import crypto, { setEngine } from "crypto";
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import pkg from 'hi-base32';
const { encode, decode } = pkg;

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


// HOTP generation https://www.ietf.org/rfc/rfc4226.txt
function generateTOTP(secret) {
  const hmac = crypto.createHmac("sha1", Buffer.from(secret, "hex"));
  const time = Math.floor(Date.now() / 1000 / 30); // 30s
  hmac.update(Buffer.from(time.toString(16).padStart(16, "0"), "hex"));

  const hmacResult = hmac.digest();
  const offset = hmacResult[19] & 0xf;
  const binaryCode =
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff);

  return (binaryCode % Math.pow(10, 6)).toString().padStart(6, "0");
}


async function generateQRCode(secretKey) {
  const secretKeyBuffer = Buffer.from(secretKey, 'hex');
  const secretKeyBase32 = encode(secretKeyBuffer).replace(/=/g, '');
  const otpauthUrl = authenticator.keyuri(
    'test@gmail.com',
    'ft_otp',
    secretKeyBase32,
  );
  const qrcode = await toDataURL(otpauthUrl);
  // console.log(qrcode)
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
} else if (argv.k) {
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
  const TOTPCode = generateTOTP(secretKey);
  console.log(TOTPCode);
  await generateQRCode(secretKey)
} else {
  console.error("No arguments provided.");
  process.exit(1);
}
