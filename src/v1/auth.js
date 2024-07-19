const app = require("express").Router();
const { resFail, resOK } = require("../helper");
const AuthController = require('../controller/authController')
const { defaultMiddleware } = require("../middleware");
const httpStatus = require('http-status')

/**
 * login router
 */
app.post(
  "/login",
  // defaultMiddleware.rules(),
  // defaultMiddleware.validate,
  async (req, res, next) => {
    try {
      const { agentId, ipAddress } = req.body;
      const authController = new AuthController()
      const payload = await authController.login(agentId, ipAddress).catch(e => { throw(e) })

      res.status(httpStatus.OK).send(payload);
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(resFail([err.toString()]));
    }
  }
);

/**
 * logout router
 */
app.post(
  "/logout",
  // defaultMiddleware.rules(),
  // defaultMiddleware.validate,
  async (req, res, next) => {
    try {
      const { agentId, ipAddress } = req.body;
      const authController = new AuthController()
      const payload = await authController.destroy(agentId, ipAddress).catch(e => { throw(e) })

      res.status(httpStatus.OK).send(payload);
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(resFail([err.toString()]));
    }
  }
);

module.exports = app;
