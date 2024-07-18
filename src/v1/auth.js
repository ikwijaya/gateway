const app = require("express").Router();
const { resFail, resOK } = require("../helper");
const sequelize = require('../db')
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
      const { agentId } = req.body;
      
      const trx = await sequelize.transaction().catch(e => { throw(e) })
      const authController = new AuthController(trx, agentId)
      const payload = await authController.login().catch(e => { throw(e) })

      res.status(httpStatus.OK).send(resOK([`Success`], payload));
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
      const { agentId } = req.body;

      const trx = await sequelize.transaction().catch(e => { throw(e) })
      const authController = new AuthController(trx, agentId)
      const payload = await authController.destroy().catch(e => { throw(e) })

      res.status(httpStatus.OK).send(resOK([`Success`], payload));
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(resFail([err.toString()]));
    }
  }
);

module.exports = app;
