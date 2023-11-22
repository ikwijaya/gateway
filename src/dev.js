const express = require("express");
const { PORT } = require("./config");
const compression = require("compression");
const app = express();
const http = require("http");
const https = require("https");
const path = require("path");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require('./swagger.json')

// set max
// https://stackabuse.com/6-easy-ways-to-speed-up-express/
http.globalAgent.maxSockets = Infinity;
https.globalAgent.maxSockets = Infinity;
app.use(express.json());
app.use(compression({ filter: shouldCompress }));

// check connection to db
const sequelize = require("./db");
const authenticate = async () => {
  try {
    await sequelize.authenticate();
    console.log("🚀 yey! your database is connected to me.");
  } catch (err) {
    console.error("sorry, something wrong with your connection: ", err);
    throw new Error(`sorry, something wrong with your connection: , ${err}`);
  }
};

const ConsumerController = require("./controller/consumerController");
const brokerBootstrap = async () => {
  try {
    const consumerController = new ConsumerController("summary.queue");
    return await consumerController.run().catch((e) => {
      throw e;
    });
  } catch (error) {
    throw error;
  }
};

authenticate();
brokerBootstrap();
app.use("/", express.static(path.join(__dirname, "template")));
app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec, { explorer: true }))
app.use(require("./v1"));
app.listen(process.env.PORT || PORT, function () {
  console.log(
    `🚀 application running in port ${PORT}`,
    this.address().port,
    app.settings.env
  );
});

// method
function shouldCompress(req, res) {
  if (req.headers["x-no-compression"]) return false;

  return compression.filter(req, res);
}
