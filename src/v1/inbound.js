const app = require("express").Router();
const { resFail, resOK } = require("../helper");
const { afterLoginMiddleware, inboundMiddleware } = require("../middleware");
const RouteController = require("../controller/routeController");
const httpStatus = require("http-status");

app.post(
  "/:channel_name?/inbound/:action?",
  afterLoginMiddleware.rules(),
  afterLoginMiddleware.validate,
  async (req, res, next) => {
    try {
      const { isToken } = req.body;
      if (isToken) next();
      else res.status(200).send(resOK([], { isToken: req.body.isToken }));
    } catch (err) {
      res.status(200).send(resFail([err.toString()]));
    }
  }
);

app.post(
  "/:channel_name?/inbound/:action?",
  inboundMiddleware.rules(),
  inboundMiddleware.validate,
  async (req, res) => {
    try {
      const { param, reqId, timestamp, route, channel, accessToken } = req.body;
      const routeController = new RouteController(null, route)
        .validate({
          timestamp: timestamp,
          reqId: reqId,
          param: param,
          webhook: {
            url: channel.webhook,
            key: channel.webhook_key,
            value: channel.webhook_value,
          },
          action: route.url_path,
          token: accessToken,
          channelName: channel.name,
        })
        .log();
      await routeController.send().catch((e) => {
        throw e;
      });

      res.status(httpStatus.OK).send(resOK([`Success`]));
    } catch (err) {
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send(resFail([err.toString()]));
    }
  }
);

module.exports = app;
