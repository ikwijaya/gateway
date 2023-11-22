const { rabbitSub, rabbitPub } = require("../broker");
const axios = require("axios").default;
const { resOK } = require("../helper");
const retry = require("retry");

// https://www.npmjs.com/package/retry
class consumerController {
  constructor(queue = null, exchange = null) {
    this.queue = queue;
    this.exchange = exchange;
    this.config = {
      retries: 3,
      factor: 2,
      minTimeout: 1 * 1000,
      maxTimeout: 60 * 1000,
      randomize: true,
    };

    this.operation = retry.operation(this.config);
  }

  async run() {
    try {
      const queue = this.queue;
      return await rabbitSub(queue, async (object) => {
        const content = object.content;
        const parse = content ? JSON.parse(content) : null;

        if (content && parse && typeof parse === "object") {
          const webhook = parse.webhook;

          delete parse["token"];
          delete parse["webhook"];

          const body = resOK(["Success"], parse);
          const headers = {};
          if (webhook.key && webhook.value)
            headers[webhook.key] = webhook.value;

          /// retry when wehbooks is no-response
          this.operation.attempt(async (currentAttempt) => {
            console.log(
              `attempt ${currentAttempt} from ${this.config.retries} times`
            );

            if (currentAttempt > this.config.retries)
              return await rabbitPub('retry.'+queue, content);

            try {
              return await axios.post(webhook.url, body, { headers: headers });
            } catch (error) {
              if (this.operation.retry(error)) {
                console.log(`Error webhook`, error.stack);
                return;
              }
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
