const amq = require("amqplib");
const { RMQ_CONNECTION } = require("../config");

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
            console.log(`PUB => 🚀 yey! connection established - `, new Date());
            connection.on("error", function (err) {
              console.log(
                `PUB => connection error: `,
                err.message,
                " - ",
                new Date()
              );
              setTimeout(async () => await run(), ms);
            });

            const channel = await connection.createChannel();
            await channel.assertQueue(queue, { durable: durable });
            channel.sendToQueue(queue, Buffer.from(value));

            await channel.close().then(() => connection.close());
          })
          .catch((e) => {
            console.log(
              `PUB => connection down: attempt ${i} from ${attempt} times`,
              e.message,
              " - ",
              new Date()
            );
            i = i + 1;

            if (i < attempt) setTimeout(async () => await run(), ms);
            else console.log(`PUB => closed by attempt ${attempt} times`);
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
            console.log(`SUB => 🚀 yey! connection established - `, new Date());
            connection.on("error", function (err) {
              console.log(
                `SUB => connection error: `,
                err.message,
                " - ",
                new Date()
              );
              setTimeout(async () => await run(), ms);
            });

            connection.on("close", function () {
              console.log(`SUB => connection close - `, new Date());
              setTimeout(async () => await run(), ms);
            });

            const channel = await connection.createChannel();
            await channel.assertQueue(queue, { durable: durable });

            channel.prefetch(1);
            await channel.consume(
              queue,
              (value) => {
                callback(
                  {
                    content: value.content.toString(),
                    properties: value.properties,
                    fields: value.fields,
                  },
                  true
                );
              },
              {
                noAck: true,
              }
            );
          })
          .catch((e) => {
            console.log(
              `SUB => connection down: `,
              e.message,
              " - ",
              new Date()
            );

            if (attempt && attempt !== 0) {
              if (i < parseInt(attempt))
                setTimeout(async () => await run(), ms);
              else console.log(`PUB => closed by attempt ${attempt} times`);
            } else setTimeout(async () => await run(), ms);
          });
      }

      await run();
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
