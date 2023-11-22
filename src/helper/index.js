const crypto = require("crypto");
const { CIPHER_IV, CIPHER_KEY, CIPHER_ALGO } = require("../config");

module.exports = {
  resFail: (msg = [], payload = null) => {
    return {
      success: false,
      messages: msg,
      color: "red",
      payload: payload,
    };
  },
  /**
   *
   * @param {*} msg
   * @param {*} payload
   */
  resOK: (msg = [], payload = null) => {
    return {
      success: true,
      messages: msg,
      color: "green",
      payload: payload,
    };
  },

  encryptText(text) {
    try {
      if (!text) return null;
      let cipher = crypto.createCipheriv(CIPHER_ALGO, CIPHER_KEY, CIPHER_IV);
      let encrypted = cipher.update(text, "utf-8");
      encrypted = Buffer.concat([encrypted, cipher.final()]);

      return encrypted.toString("hex");
    } catch (error) {
      throw error;
    }
  },

  /**
   *
   * @param {*} text
   */
  decryptText(text) {
    try {
      if (!text) return null;
      let encryptedText = Buffer.from(text, "hex");
      let decipher = crypto.createDecipheriv(
        CIPHER_ALGO,
        CIPHER_KEY,
        CIPHER_IV
      );
      let decrypted = decipher.update(encryptedText);

      return decrypted.toString();
    } catch (error) {
      throw error;
    }
  },

  /**
   *
   * @param {*} text
   * @param {*} key
   * @param {*} iv
   * @returns
   */
  encryptTextCustom(text, key, iv) {
    try {
      const algo = "aes-256-gcm";
      if (!text) return null;
      let cipher = crypto.createCipheriv(algo, key, iv);
      let encrypted = cipher.update(text, "utf-8");
      encrypted = Buffer.concat([encrypted, cipher.final()]);

      return encrypted.toString("hex");
    } catch (error) {
      throw error;
    }
  },

  /**
   *
   * @param {*} text
   * @param {*} key
   * @param {*} iv
   * @returns
   */
  decryptTextCustom(text, key, iv) {
    try {
      const algo = "aes-256-gcm";
      if (!text) return null;
      const encryptedText = Buffer.from(text, "hex");
      let decipher = crypto.createDecipheriv(algo, key, iv);
      let decrypted = decipher.update(encryptedText);

      return decrypted.toString();
    } catch (error) {
      throw error;
    }
  },
};
