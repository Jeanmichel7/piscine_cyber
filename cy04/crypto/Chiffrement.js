import crypto from "crypto";
import fs from "fs";

export default class Chiffrement {
  #rsaPublicKeyPath = "crypto/rsa_public_key.pem";
  #rsaPrivateKeyPath = "crypto/rsa_private_key.pem";

  constructor() {
    this.#initRSAKeys();
    this.#initAESKeys();
  }

  /* ********************** */
  /*           RSA          */
  /* ********************** */
  #initRSAKeys() {
    if (
      !fs.existsSync(this.#rsaPublicKeyPath) ||
      !fs.existsSync(this.#rsaPrivateKeyPath)
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
      fs.writeFileSync(this.#rsaPublicKeyPath, keyPair.publicKey);
      fs.writeFileSync(this.#rsaPrivateKeyPath, keyPair.privateKey);
    }
  }
  #getRSAPublicKey() {
    return fs.readFileSync(this.#rsaPublicKeyPath, "utf8");
  }
  #getRSAPrivateKey() {
    return fs.readFileSync(this.#rsaPrivateKeyPath, "utf8");
  }

  rsaEncrypt(data) {
    return crypto.publicEncrypt(this.#getRSAPublicKey(), Buffer.from(data));
  }
  rsaDecrypt(data) {
    // console.log(data);
    return crypto.privateDecrypt(this.#getRSAPrivateKey(), data).toString();
  }





  /* ********************** */
  /*           AES          */
  /* ********************** */

  #initAESKeys() {
    if (!fs.existsSync("crypto/aes_key.enc")) {
      let aesKey = crypto.randomBytes(32);
      aesKey = aesKey.toString("hex");
      // console.log('init AES key : ', aesKey)

      //chiffre AES key with RSA
      const encryptedAESKey = this.rsaEncrypt(aesKey);
      fs.writeFileSync("crypto/aes_key.enc", encryptedAESKey.toString("hex"));
    }
  }

  #getAESKey() {
    const aesKeyHex = fs.readFileSync("crypto/aes_key.enc", "utf8");
    const encryptedKey = Buffer.from(aesKeyHex, "hex");
    const aesKey = this.rsaDecrypt(encryptedKey);
    return Buffer.from(aesKey, "hex");
  }

  aesEncryptWithIV(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      this.#getAESKey(),
      iv
    );
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  }

  aesDecryptWithIV(data) {
    const textParts = data.split(":");
    const iv = Buffer.from(textParts.shift(), "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      this.#getAESKey(),
      iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}