const app = require("express").Router();
const { resFail, resOK } = require("../helper");
const sequelize = require('../db')
const TokenController = require('../controller/tokenController')
const { defaultMiddleware } = require("../middleware");
const httpStatus = require('http-status')

app.get(
  "/create-token",
  defaultMiddleware.rules(),
  defaultMiddleware.validate,
  async (req, res, next) => {
    try {
      const { channel } = req.body;
      
      const expiresIn = channel.expires_in;
      const trx = await sequelize.transaction().catch(e => { throw(e) })
      const tokenController = new TokenController(trx, channel, expiresIn ? expiresIn : "6h")
      const accessToken = await tokenController.create().catch(e => { throw(e) })

      res.status(httpStatus.OK).send(resOK([], accessToken));
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(resFail([err.toString()]));
    }
  }
);

module.exports = app;
