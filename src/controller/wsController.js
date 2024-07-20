const AuthController = require('./authController')
const { parseQS } = require('../helper')

class WSController {
  constructor(server = null) {
    this.server = server;
  }

  async run(wss = null) {
    function onSocketError(err) { console.error(err) }
    this.server.on('upgrade', async function (request, socket, head) {
      socket.on('error', onSocketError)
      socket.removeListener('error', onSocketError)
      /**
       * we emit from the upgrade to connection event
       * for makesure the user has ws data
       */
      wss.handleUpgrade(request, socket, head, async function (ws) {
        const { ipAddress } = parseQS(request.url);
        const authController = new AuthController();
        await authController.connect(ipAddress, ws).catch(e => { throw e })

        wss.emit('connection', ws, request, socket)
      })
    })

    /**
     * handle when user is starting connection to ws
     * handle after upgrade
     * 
     * life-cycle: send pub with {emit} event, then grab the sub with {on} event
     * {emit} => {on}
     */
    wss.on('connection', async function (ws, request, socket) {
      const { agentId, ipAddress } = parseQS(request.url);
      const authController = new AuthController();
      const find = await authController.getByIpAddr(ipAddress).catch(e => { throw e })
      if (!find) await authController.connect(ipAddress, ws).catch(e => { throw e })

      /**
       * define events here
       */
      ws.on('error', console.error)
      ws.on('close', async function () { await authController.destroy(ipAddress, agentId).catch(e => { throw e }) })
      ws.on('message', function (message) { console.log(`message from ${message} from ${agentId}`) })
    })

    wss.on('record-start', (bool, { agentId, ipAddress }) => {
      console.log(`record start`, bool, agentId, ipAddress)
    })
  }
}

module.exports = WSController;
