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
// app.use(
//   IpFilter(WHITELIST_IP, {
//     mode: "allow",
//     logLevel: "deny",
//     excluding: ["/docs", "/v1"],
//     detectIp: customIpDetection,
//   })
// );

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

/**
 * web socket here,
 * the session is managed by sequelize customs Auth
 */
const { WebSocketServer } = require('ws')
const server = http.createServer(app)
const wss = new WebSocketServer({ clientTracking: false, noServer: true })
const AuthController = require('./controller/authController')

function onSocketError(err) { console.error(err) }
server.on('upgrade', async function (request, socket, head) {
  socket.on('error', onSocketError)

  const trx = await sequelize.transaction().catch(e => { throw (e) })
  const { agentId } = parseQS(request.url);
  const authController = new AuthController(trx, agentId)
  const find = await authController.get().catch(e => { throw e })
  if (!find) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }

  socket.removeListener('error', onSocketError)
  /**
   * we emit from the upgrade to connection event
   * for makesure the user has ws data
   */
  wss.handleUpgrade(request, socket, head, function (ws) {
    wss.emit('connection', ws, request)
  })
})

/**
 * handle when user is starting connection to ws
 * handle after upgrade
 * 
 * life-cycle: send pub with {emit} event, then grab the sub with {on} event
 * {emit} => {on}
 */
wss.on('connection', async function (ws, request) {
  const trx = await sequelize.transaction().catch(e => { throw (e) })
  const { agentId } = parseQS(request.url);
  const authController = new AuthController(trx, agentId)
  await authController.update(ws).catch(e => { throw e })

  /**
   * define events here
   */
  ws.on('error', console.error)
  ws.on('close', async function () { await authController.destroy().catch(e => { throw e }) })
  ws.on('message', function (message) { console.log(`message from ${message} from ${agentId}`) })
})

/// run app
server.listen(process.env.PORT || PORT, function () {
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

/**
 * 
 * @param {*} url 
 * @returns 
 */
function parseQS(url) {
  const query = url.split('?')[1];
  const params = {};
  if (query) {
    const pairs = query.split('&');
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  }
  return params;
}