const { models } = require("../db");
const { Op } = require("sequelize");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

class TokenController {
  constructor(trx = null, channel, expiresIn = "6h") {
    this.trx = trx;
    this.channel = channel;
    this.expiresIn = expiresIn;
  }

  async create() {
    try {
      const id = this.channel.channel_id,
        secret_key = this.channel.secret_key;
      const accessToken = crypto.randomBytes(32).toString("hex");
      const object = {
        access_token: accessToken,
        dcreate: new Date(),
        ucreate: id,
        channel_id: id,
        expires_in: this.expiresIn,
        record_status: "A",
      };

      /// disable active-token before create new one
      await models.token
        .update(
          { record_status: "N", umodified: id, dmodified: new Date() },
          {
            transaction: this.trx,
            where: {
              channel_id: id,
              record_status: "A"
            },
          }
        )
        .catch((e) => {
          throw e;
        });

      await models.token
        .create(object, { transaction: this.trx })
        .catch((e) => {
          throw e;
        });

      await this.trx.commit();
      return {
        accessToken: jwt.sign({ accessToken, channelId: id }, secret_key, {
          expiresIn: this.expiresIn,
        }),
      };
    } catch (error) {
      await this.trx.rollback();
      throw error;
    }
  }
}

module.exports = TokenController;
