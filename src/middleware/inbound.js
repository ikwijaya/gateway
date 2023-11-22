const { param, validationResult, header, body } = require("express-validator");
const { resFail } = require("../helper");
const { models } = require("../db");
const httpStatus = require("http-status");

const rules = () => [
  param("action", "Your action is not registered").exists().custom(isAction),
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
 * @param {*} param1
 */
const isAction = async (value, { req }) => {
  try {
    const { channel_id } = req.body.channel;
    const route = await models.route
      .findOne({
        attributes: ["route_id", "exchange", "queue", "file_schema", "url_path"],
        include: [
          {
            required: true,
            model: models.access,
            where: {
              record_status: "A",
              channel_id: channel_id,
            },
          },
        ],
        where: { record_status: "A", url_path: value },
      })
      .catch((e) => {
        throw e;
      });

    if (!route) throw new Error();
    req.body.route = route;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  rules,
  validate,
};
