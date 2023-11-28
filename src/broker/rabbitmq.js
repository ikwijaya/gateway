const amq = require("amqplib");
const { RMQ_CONNECTION } = require("../config");
const { logger } = require("../helper");

module.exports = {
  pub: async (
    queue = null,
    value = null,
    durable = true,
    ms = 1000,
    attempt = 5
  ) => {
    let conn;
    try {
      if (!queue) throw new Error("Queue not set");
      if (!value) throw new Error("No value to send");
      value = JSON.stringify(value);

      let i = 0;
      async function run() {
        return await amq
          .connect(RMQ_CONNECTION + "?heartbeat=60")
          .then(async (connection) => {
            logger("PUB", "connected!");
            connection.on("error", function (err) {
              logger("PUB", "on error", err.message);
              setTimeout(async () => await run(), ms);
            });

            const channel = await connection
              .createConfirmChannel()
              .catch((e) => {
                throw e;
              });

            return await channel
              .assertQueue(queue, { durable: durable })
              .then(async () => {
                channel.sendToQueue(queue, Buffer.from(value), {
                  persistent: true,
                });
                return await channel.close().then(() => connection.close());
              })
              .catch((e) => {
                throw e;
              });
          })
          .catch((e) => {
            i = i + 1;

            if (i < attempt) setTimeout(async () => await run(), ms);
            else logger("PUB", `force close by (${attempt}) attempt!`);
          });
      }

      conn = await run();
    } catch (error) {
      throw new Error(error);
    } finally {
      if (conn) await conn.close();
    }
  },

  sub: async (
    queue = null,
    callback = null,
    durable = true,
    ms = 1000,
    attempt = null
  ) => {
    try {
      if (!queue) throw new Error("Queue not set");
      if (!callback) throw new Error("Callback not set");
      if (typeof callback !== "function") throw new Error("Callback not set");

      let i = 0;
      async function run() {
        return await amq
          .connect(RMQ_CONNECTION + "?heartbeat=60")
          .then(async (connection) => {
            logger("SUB", "connected!");
            connection.on("error", function (err) {
              logger("SUB", "on error", err.message);
              setTimeout(async () => await run(), ms);
            });

            connection.on("close", function () {
              logger("SUB", "on close");
              setTimeout(async () => await run(), ms);
            });

            const channel = await connection.createChannel();
            return await channel
              .assertQueue(queue, { durable: durable })
              .then(async () => {
                return await channel.consume(
                  queue,
                  (value) => {
                    callback(
                      {
                        content: value.content.toString(),
                        properties: value.properties,
                        fields: value.fields,
                      },
                      channel,
                      value
                    );
                  },
                  {
                    noAck: true,
                  }
                );
              });
          })
          .catch((e) => {
            logger("SUB", `on down`, e.message);
            if (attempt && attempt !== 0) {
              if (i < parseInt(attempt))
                setTimeout(async () => await run(), ms);
              else logger("SUB", `force close by (${attempt}) attempt!`);
            } else setTimeout(async () => await run(), ms);
          });
      }

      return await run();
    } catch (error) {
      throw new Error(error);
    }
  },

  schema: () => {
    return {
      title: "inbound.queue-schema",
      type: "object",
      properties: {
        /// get while validator run internally
        webhook: {
          type: "object",
          properties: {
            url: { type: "string" },
            key: { type: "string", nullable: true },
            value: { type: "string", nullable: true },
          },
        },
        action: { type: "string" },
        token: { type: "string" },
        channelName: { type: "string" },

        /// from req external req.body
        reqId: { type: "string" },
        timestamp: { type: "string" },
        param: { type: "object" },
        response: { type: "object" },
        info: { type: "object" },
      },
      required: [
        "reqId",
        "timestamp",
        "param",
        "webhook",
        "action",
        "token",
        "channelName",
      ],
      additionalProperties: false,
    };
  },
};
