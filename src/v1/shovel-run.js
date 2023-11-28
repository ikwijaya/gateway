const app = require("express").Router();
const { resFail, resOK } = require("../helper");
const httpStatus = require("http-status");
const ShovelController = require("../controller/shovelController");
const { RMQ_SHOVEL_CREDENTIAL } = require("../config");

app.post("/shovel/:shovel_name?/:ms?/run", async (req, res, next) => {
  try {
    const { shovel_name, ms } = req.params;
    const shovelController = new ShovelController(
      shovel_name,
      RMQ_SHOVEL_CREDENTIAL
    ).validate(req.body);
    await shovelController.run().catch((e) => {
      throw e;
    });

    setTimeout(
      async () =>
        await shovelController.delete().catch((e) => {
          throw e;
        }),
      ms && ms !== "" ? parseInt(ms) : 10000
    );

    res
      .status(httpStatus.OK)
      .send(
        resOK([
          `Shovel running for ${ms && ms !== "" ? parseInt(ms) : 10000} ms`,
        ])
      );
  } catch (err) {
    let payload = null;
    if (err.response) if (err.response.data) payload = err.response.data;
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send(resFail([err.toString()], payload));
  }
});

module.exports = app;
