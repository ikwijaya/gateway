const { rabbitSub, rabbitPub } = require("../broker");
const axios = require("axios").default;
const { resOK, logger } = require("../helper");
const retry = require("retry");

// https://www.npmjs.com/package/retry
class consumerController {
  constructor(queue = null, exchange = null) {
    this.queue = queue;
    this.exchange = exchange;
    this.config = {
      retries: 2,
      factor: 1,
      minTimeout: 1 * 1000,
      maxTimeout: 60 * 1000,
      randomize: true,
    };

    this.operation = retry.operation(this.config);
  }

  async run() {
    try {
      const queue = this.queue;
      return await rabbitSub(queue, async (object, channel, value) => {
        const content = object.content;
        const parse = content ? JSON.parse(content) : null;

        if (content && parse && typeof parse === "object") {
          const webhook = parse.webhook;
          const info = `${parse["channelName"]}/${parse["action"]}/${parse["reqId"]}`;

          delete parse["token"];
          delete parse["webhook"];

          const body = resOK(["Success"], parse);
          const headers = {};
          if (webhook.key && webhook.value)
            headers[webhook.key] = webhook.value;

          /// retry when wehbooks is no-response
          this.operation.attempt(async (currentAttempt) => {
            if (currentAttempt > this.config.retries) {
              let obj = JSON.parse(content);
              obj["info"]["retry." + queue] = new Date();
              obj = JSON.stringify(obj);

              await channel
                .assertQueue("retry." + queue)
                .then(async () => {
                  return await channel.sendToQueue(
                    "retry." + queue,
                    Buffer.from(obj)
                  );
                })
                .catch((e) => {
                  throw e;
                });
              logger(
                "WEBHOOK",
                `[${info}] attempts reached (${this.config.retries})`
              );
            }

            try {
              return await axios
                .post(webhook.url, body, { headers: headers })
                .then(async (res) => {
                  logger(`WEBHOOK`, res.status, JSON.stringify(res.data));
                  await channel.assertQueue("logger.queue").then(async () => {
                    const log = JSON.stringify({
                      flag: 'outgoing',
                      url: webhook.url,
                      req: body,
                      res: res.data,
                      status: res.status,
                      dcreate: new Date(),
                      record_status: "A",
                    });
                    return await channel.sendToQueue(
                      "logger.queue",
                      Buffer.from(log)
                    );
                  });
                })
                .catch(async (err) => {
                  if (this.operation.retry(err)) return;
                  return await channel
                    .assertQueue("logger.queue")
                    .then(async () => {
                      const log = JSON.stringify({
                        flag: 'outgoing',
                        url: webhook.url,
                        req: body,
                        res: err.message,
                        status: err.status,
                        dcreate: new Date(),
                        record_status: "A",
                      });
                      return await channel.sendToQueue(
                        "logger.queue",
                        Buffer.from(log)
                      );
                    });
                });
            } catch (error) {
              if (this.operation.retry(error)) return;
            }
          });
        }
      }).catch((e) => {
        throw e;
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = consumerController;
