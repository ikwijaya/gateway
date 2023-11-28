const app = require("express").Router();
const { resFail, resOK } = require("../helper");
const httpStatus = require("http-status");
const ShovelController = require("../controller/shovelController");
const { RMQ_SHOVEL_CREDENTIAL } = require("../config");

app.get("/shovel/:shovel_name?/restart", async (req, res, next) => {
  try {
    const { shovel_name } = req.params;
    const shovelController = new ShovelController(
      shovel_name,
      RMQ_SHOVEL_CREDENTIAL
    );
    const run = await shovelController.restart().catch((e) => {
      throw e;
    });

    res.status(httpStatus.OK).send(resOK([`Success`], run.data));
  } catch (err) {
    let payload = null;
    if (err.response) if (err.response.data) payload = err.response.data;
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send(resFail([err.toString()], payload));
  }
});

module.exports = app;
