const AuthController = require('./authController')
const { parseQS } = require('../helper')

class WSController {
  constructor(server = null, app = null) {
    this.server = server;
    this.clients = new Map();
    this.app = app;
  }

  async run(wss = null) {
    try {
      function onSocketError(err) { console.error(err) }
      const that = this
      this.server.on('upgrade', async function (request, socket, head) {
        socket.on('error', onSocketError)
        socket.removeListener('error', onSocketError)
        /**
         * we emit from the upgrade to connection event
         * for makesure the user has ws data
         */
        wss.handleUpgrade(request, socket, head, async function (ws) {
          const { ipAddress } = parseQS(request.url);

          if (!ipAddress) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy()
            return
          }

          ws.id = ipAddress
          const authController = new AuthController();
          await authController.connect(ipAddress, ws).catch(e => { throw e })

          // const clients = await authController.loadAll().catch(e => { throw e })
          // clients.forEach(e => {
          //   const _ipAddress = e.getDataValue('ip_addr')
          //   that.clients.set(_ipAddress, ws)
          // })
          that.clients.set(ipAddress, ws)
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
        const { ipAddress } = parseQS(request.url);
        const authController = new AuthController();
        const find = await authController.getByIpAddr(ipAddress).catch(e => { throw e })
        if (!find) await authController.connect(ipAddress, ws).catch(e => { throw e })

        /**
         * define events here
         */
        ws.on('error', console.error)
        ws.on('close', async function () { 
          delete that.clients[ipAddress] 
          await authController.destroy(ipAddress).catch(e => { throw e })
        })

        ws.on('message', function (message) { 
          const parsed = JSON.parse(message)
          if(parsed.action === 'ping') return sendPong(parsed.senderId)
        })

        /**
         * pong connection
         * @param {*} senderId 
         */
        const sendPong = (senderId=null) => {
          that.clients.forEach((_ws, value) => {
            if (value === senderId) _ws.send(JSON.stringify({ senderId: senderId, action: 'pong', payload: { message: `connected ${new Date()}` } }))
          })
        }

        /**
         * send info, 
         * for new joiner
         */
        that.clients.forEach((_ws, value) => {
          if (value === ipAddress) _ws.send(JSON.stringify({ senderId: ipAddress, action: 'join', payload: { message: `${ipAddress} has joined` } }))
        })
      })
    } catch (error) {
      throw error
    }
  }

  get() { return this.clients }
}

module.exports = WSController;
