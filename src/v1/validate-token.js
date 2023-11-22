const app = require("express").Router();
const { resFail, resOK } = require("../helper");
const { afterLoginMiddleware } = require("../middleware");

app.get(
  "/:channel_name?/validate-token",
  afterLoginMiddleware.rules(),
  afterLoginMiddleware.validate,
  async (req, res, next) => {
    try {
      res.status(200).send(resOK([], { isToken: req.body.isToken }));
    } catch (err) {
      res.status(200).send(resFail([err.toString()]));
    }
  }
);

module.exports = app;
