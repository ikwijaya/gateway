const { validationResult, header } = require("express-validator");
const { API_KEY } = require("../config");
const { resFail } = require("../helper");
const { models } = require("../db");
const httpStatus = require('http-status')

const rules = () => [
  header("CIMB-APIKEY", "Invalid Application Key").exists().equals(API_KEY),
  header("APP-ID", "Invalid Application ID").exists().custom(isAppID),
];
const validate = (req, res, next) => {
  let msg = [];
  const e = validationResult(req);
  if (e.isEmpty()) return next();

  const arr = e && e.errors ? e.errors : [];
  arr.forEach((e) => {
    msg.push(`Error: ${e.msg} on ${e.param} within ${e.location}`);
  });

  res.status(httpStatus.INTERNAL_SERVER_ERROR).send(resFail(msg));
};

/**
 *
 * @param {*} value
 * @param {*} { req }
 */
const isAppID = async (value, { req }) => {
  try {
    /// check value in database
    const channel = await models.channel
      .findOne({
        attributes: ["channel_id", "name", "secret_key", "expires_in"],
        where: { app_key: value, record_status: "A" },
      })
      .catch((e) => {
        throw e;
      });

    if (!channel) throw new Error();
    req.body.channel = channel;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  rules,
  validate,
};
