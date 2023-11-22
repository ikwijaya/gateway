const rabbitPub = require('./rabbitmq').pub
const rabbitSub = require('./rabbitmq').sub
const rabbitSchema = require('./rabbitmq').schema

module.exports = {
    rabbitPub, rabbitSub, rabbitSchema
}