const app = require("express").Router();
const { resFail, resOK } = require("../helper");
const AuthController = require('../controller/authController')
const { defaultMiddleware } = require("../middleware");
const httpStatus = require('http-status')

app.post(
  "/online",
  // defaultMiddleware.rules(),
  // defaultMiddleware.validate,
  async (req, res, next) => {
    try {
      const { agentId, ipAddress } = req.body;
      const authController = new AuthController()
      const payload = await authController.login(agentId, ipAddress).catch(e => { throw(e) })
      const ws = payload.payload.ws;

      // ws.emit('record-start', true, { agentId, ipAddress });
      delete payload.payload.ws;
      res.status(httpStatus.OK).send(payload);
    } catch (err) {
      console.log(err)
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(resFail([err.toString()]));
    }
  }
);

module.exports = app;
