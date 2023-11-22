
const defaultMiddleware = require('./default')
const afterLoginMiddleware = require('./after')
const inboundMiddleware = require('./inbound')

module.exports = {
    defaultMiddleware,
    afterLoginMiddleware,
    inboundMiddleware
}