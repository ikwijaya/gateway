const {
  SQ_LOG,
  DB_SSL,
  DB_URL,
  DB_CLIENT,
  APP_NAME,
  LOG_ROTATE_SQL_PATH,
  LOG_ROTATE_PERIOD,
  NODE_ENV,
} = require("./config");
const { Sequelize } = require("sequelize");
const { assoc } = require("./db_assoc");
const bunyan = require("bunyan");
const { encryptText } = require("./helper");
const log = bunyan.createLogger({
  name: APP_NAME,
  serializers: bunyan.stdSerializers,
  streams: [
    {
      type: "rotating-file",
      path: LOG_ROTATE_SQL_PATH,
      period: LOG_ROTATE_PERIOD,
      count: 3,
      level: "info",
    },
  ],
});

// Override timezone formatting for MSSQL
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format("YYYY-MM-DD HH:mm:ss.SSS");
};

const sq = new Sequelize(DB_URL, {
  logging: (msg) =>
    SQ_LOG == "1"
      ? log.info(NODE_ENV == "production" ? encryptText(msg) : msg)
      : false,
  dialect: DB_CLIENT,
  dialectOptions: {
    // ssl: DB_SSL ? { require: true, rejectUnauthorized: false } : null,
  },
  pool: {
    max: 500,
    min: 0,
    acquire: 10000,
  },
});

const df = [
  require("./schema/Access.Model"),
  require("./schema/Channel.Model"),
  require("./schema/Response.Model"),
  require("./schema/Route.Model"),
  require("./schema/Session.Model"),
  require("./schema/Token.Model"),
];

// build association/relationship
// refer: https://github.com/sequelize/express-example/tree/master/express-main-example/sequelize
for (let m of df) {
  m(sq);
}
assoc(sq);

module.exports = sq;
