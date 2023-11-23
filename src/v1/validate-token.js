const app = require("express").Router();
const { resFail, resOK } = require("../helper");
const { afterLoginMiddleware } = require("../middleware");
const httpStatus = require('http-status')

app.get(
  "/:channel_name?/validate-token",
  afterLoginMiddleware.rules(),
  afterLoginMiddleware.validate,
  async (req, res, next) => {
    try {
      res.status(httpStatus.OK).send(resOK([], { isToken: req.body.isToken }));
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(resFail([err.toString()]));
    }
  }
);

module.exports = app;
