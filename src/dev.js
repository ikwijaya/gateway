const express = require("express");
const { PORT, RMQ_CONSUMER_QUEUE, WHITELIST_IP } = require("./config");
const compression = require("compression");
const app = express();
const http = require("http");
const https = require("https");
const path = require("path");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./swagger.json");
const { IpDeniedError, IpFilter } = require("express-ipfilter");
const { customIpDetection, resFail } = require("./helper");

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
    console.log("🚀 yey! your database is connected to me.", new Date());
  } catch (err) {
    console.error("DB => ", JSON.stringify(err.original), new Date());
    setTimeout(authenticate, 2000);
  }
};

const ConsumerController = require("./controller/consumerController");
const brokerBootstrap = async () => {
  try {
    const consumerController = new ConsumerController(RMQ_CONSUMER_QUEUE);
    return await consumerController.run().catch((e) => {
      throw e;
    });
  } catch (error) {
    throw error;
  }
};

authenticate();
brokerBootstrap();
app.use(
  IpFilter(WHITELIST_IP, {
    mode: "allow",
    logLevel: "deny",
    excluding: ["/docs", "/v1"],
    detectIp: customIpDetection,
  })
);

app.use("/", express.static(path.join(__dirname, "template")));
app.use(
  "/docs",
  swaggerUI.serve,
  swaggerUI.setup(swaggerSpec, { explorer: true })
);
app.use(require("./v1"));

app.get("/schema", (req, res, next) => {
  res.send(require("../route-schema/summary-text.json"));
});

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
