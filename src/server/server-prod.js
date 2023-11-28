const express = require("express");
const {
  NODE_ENV,
  PORT,
  APP_NAME,
  SQ_LOG,
  LOG_ROTATE_ROUTE_PATH,
  LOG_ROTATE_PERIOD,
  RMQ_CONSUMER_QUEUE,
  WHITELIST_IP,
} = require("../config");
const compression = require("compression");
const app = express();
const http = require("http");
const https = require("https");
const bunyan = require("bunyan");
const ipFilter = require("express-ipfilter").IpFilter;
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("../swagger.json");
const log = bunyan.createLogger({
  name: APP_NAME,
  serializers: bunyan.stdSerializers,
  streams: [
    {
      type: "rotating-file",
      path: LOG_ROTATE_ROUTE_PATH,
      period: LOG_ROTATE_PERIOD,
      count: 3,
      level: "info",
    },
  ],
});

// set max
// https://stackabuse.com/6-easy-ways-to-speed-up-express/
http.globalAgent.maxSockets = Infinity;
https.globalAgent.maxSockets = Infinity;

app.use(express.json());
app.use(compression({ filter: shouldCompress }));

// check connection to db
const sequelize = require("../db");
const authenticate = async () => {
  try {
    await sequelize.authenticate();
    console.log("🚀 yey! your database is connected to me.", new Date());
  } catch (err) {
    console.error("DB => ", JSON.stringify(err.original), new Date());
    setTimeout(authenticate, 2000);
  }
};

const ConsumerController = require("../controller/consumerController");
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
app.use((req, res, next) => {
  res.on("finish", () => {
    const qq = req;
    delete qq.headers.authorization;
    delete qq.headers["access-token"];

    if (SQ_LOG == "1") {
      log.info({
        req: {
          env: NODE_ENV,
          method: qq.method,
          baseUrl: qq.baseUrl,
          originalUrl: qq.originalUrl,
        },
      });
    }
  });
  next();
});
app.use(
  "/docs",
  swaggerUI.serve,
  swaggerUI.setup(swaggerSpec, { explorer: true })
);

app.use(ipFilter(WHITELIST_IP, { mode: 'allow', logLevel: 'deny' }))
app.use(require("../v1"));
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
