const { param, validationResult, header } = require("express-validator");
const { API_KEY } = require("../config");
const { resFail } = require("../helper");
const jwt = require("jsonwebtoken");
const { models } = require("../db");
const httpStatus = require("http-status");

const rules = () => [
  param("channel_name", "Your channel is not found or registered")
    .exists()
    .custom(isChannel),
  header("CIMB-APIKEY", "Invalid Application Key").exists().equals(API_KEY),
  header("authorization", "Your access token is invalid or expires.").custom(
    isJwt
  ),
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
const isJwt = async (value, { req }) => {
  try {
    const { channel } = req.body;
    if (!channel) throw new Error();

    const token = jwt.verify(value, channel.secret_key);
    const isToken = await models.token
      .count({
        attributes: ["token_id"],
        where: {
          channel_id: channel.channel_id,
          access_token: token.accessToken,
          record_status: "A",
        },
      })
      .catch((e) => {
        throw e;
      });

    if (isToken == 0) throw new Error();
    req.body.accessToken = token.accessToken;
    req.body.isToken = isToken > 0;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} value
 * @param {*} { req }
 */
const isChannel = async (value, { req }) => {
  try {
    if (!value) throw new Error();

    const channel = await models.channel
      .findOne({
        attributes: [
          "secret_key",
          "channel_id",
          "webhook",
          "webhook_key",
          "webhook_value",
          "name"
        ],
        where: { record_status: "A", name: value },
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
