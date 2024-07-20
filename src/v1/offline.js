const app = require("express").Router();
const { resFail, resOK } = require("../helper");
const AuthController = require('../controller/authController')
const { defaultMiddleware } = require("../middleware");
const httpStatus = require('http-status')

app.post(
  "/offline",
  // defaultMiddleware.rules(),
  // defaultMiddleware.validate,
  async (req, res, next) => {
    try {
      const { agentId, ipAddress } = req.body;
      const authController = new AuthController()
      const payload = await authController.destroy(agentId, ipAddress).catch(e => { throw(e) })

      req.ws.emit('record-stop', false, { agentId, ipAddress });
      res.status(httpStatus.OK).send(payload);
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(resFail([err.toString()]));
    }
  }
);

module.exports = app;
