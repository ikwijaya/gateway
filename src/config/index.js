/**
 * DB_URL: "toUrl",
 */
const cfg = process.env;
const crypto = require("crypto");

module.exports = {
  APP_ENCRYPTION: cfg.APP_ENCRYPTION,
  APP_NAME: cfg.APP_NAME,
  NODE_ENV: cfg.NODE_ENV,
  PORT: cfg.PORT,
  API_KEY: cfg.API_KEY,
  SECRET_KEY: cfg.SECRET_KEY,
  IMAGE_URI: cfg.IMAGE_URI,
  CROSS_ORIGIN: split(cfg.CROSS_ORIGIN,','),
  
  /**
   * Security
   */
  PRIVATE_KEY: cfg.PRIVATE_KEY,
  CIPHER_KEY: cfg.CIPHER_KEY,
  CIPHER_IV: cfg.CIPHER_IV,
  CIPHER_ALGO: cfg.CIPHER_ALGO,
  
  /**
   * call to outer API
   */
  

  /**
   * DATABASE
   */
  DB_SCHEMA: cfg.DB_SCHEMA,
  // DB_URL: decryptText(cfg.DB_URL),
  DB_URL: cfg.DB_URL,
  DB_CLIENT: cfg.DB_CLIENT,
  DB_SSL: cfg.DB_SSL,
  SQ_SYNC: cfg.SQ_SYNC,
  SQ_INIT: cfg.SQ_INIT,
  SQ_ALTER: cfg.SQ_ALTER,
  SQ_FORCE: cfg.SQ_FORCE,
  SQ_LOG: cfg.SQ_LOG,
  PGSSLMODE: cfg.PGSSLMODE,

  /**
   * QUEUE 
   * RABBIT-MQ
   */
  RMQ_CONNECTION: cfg.RMQ_CONNECTION,
  RMQ_CONSUMER_QUEUE: cfg.RMQ_CONSUMER_QUEUE,
  RMQ_FALLBACK_QUEUE: cfg.RMQ_FALLBACK_QUEUE,
  

  /**
   * LOG ROTATE
   */
  LOG_ROTATE_SQL_PATH: cfg.LOG_ROTATE_SQL_PATH,
  LOG_ROTATE_ROUTE_PATH: cfg.LOG_ROTATE_ROUTE_PATH,
  LOG_ROTATE_PERIOD: cfg.LOG_ROTATE_PERIOD,

  /**
   * CHANNEL SCHEMA
   */
  ROUTE_SCHEMA_PATH: cfg.ROUTE_SCHEMA_PATH,

  ///// default wording
  WORDING: {
    NO_AUTH: `Sorry, your account have no auth for this page/action`,
    HAS_WAITING: `Sorry, data is status waiting for approval`,
    NO_PRIVILEGES: `Sorry, your account have no privileges`,
    DATA_NOT_FOUND: `Data not found or data is disabled`,
    ERROR_DATA_INPUT: `Wrong data input`,
    NO_REVIEWER: `No user as REVIEWER has registered. Please contact your leader`,
    NO_MAKER: `No user as MAKER has registered. Please contact your leader`,
    DATA_EXISTS: `Data already exists`
  }
};

/**
 *
 * @param {*} str
 * @param {*} d
 */
function split(str = ``, d = ",") {
  if (!str) return [];
  return str.split(d);
}

////////////////////////////////////////////////////
// decryptor
///////////////////////////////////////////////////
function decryptText(text) {
  try {
    if (!text) return null;
    let encryptedText = Buffer.from(text, "hex");
    let decipher = crypto.createDecipheriv(
      cfg.CIPHER_ALGO,
      cfg.CIPHER_KEY,
      cfg.CIPHER_IV
    );
    let decrypted = decipher.update(encryptedText);

    return decrypted.toString();
  } catch (error) {
    throw error;
  }
}
