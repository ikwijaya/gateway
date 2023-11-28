const app = require("express").Router();
const { resFail, resOK } = require("../helper");
const { models } = require("../db");
const sequelize = require("../db");
const httpStatus = require("http-status");

app.post("/response/create", async (req, res, next) => {
  const t = await sequelize.transaction().catch((e) => {
    throw e;
  });
  try {
    const values = {
      res: JSON.stringify(req.body),
      dcreate: new Date(),
      record_status: "A",
    };

    await models.response.create(values, { transaction: t }).catch((e) => {
      throw e;
    });

    await t.commit();
    res.status(httpStatus.OK).send(resOK([]));
  } catch (err) {
    await t.rollback();
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send(resFail([err.toString()]));
  }
});

module.exports = app;
