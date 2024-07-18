const { models } = require("../db");
const { Op } = require("sequelize");
const crypto = require("crypto");
const dayjs = require('dayjs');

class AuthController {
  constructor(trx = null, agentId = null, expiresHour = 6) {
    this.trx = trx;
    this.expiresHour = expiresHour;
    this.agentId = agentId;
  }

  /**
   * 
   * @returns 
   */
  async login() {
    try {
      const expiresHour = this.expiresHour;
      const expires = dayjs().add(expiresHour, 'hours');
      const accessToken = crypto.randomBytes(32).toString("hex");
      const agentId = this.agentId;

      //// destroy last login
      await models.session
        .update({ record_status: 'N' },
          {
            where: { user_id: agentId, record_status: 'A' },
            transaction: this.trx
          })
        .catch((e) => {
          throw e;
        });

      //// recreate new session
      await models.session
        .create({
          dcreate: new Date(),
          token: accessToken,
          expires: expires,
          user_id: agentId,
          record_status: 'A'
        }, { transaction: this.trx })
        .catch((e) => {
          throw e;
        });

      await this.trx.commit();
      return {
        expiresHour,
        expires,
        accessToken,
        agentId
      };
    } catch (error) {
      await this.trx.rollback();
      throw error;
    }
  }

  /**
   * 
   * @returns 
   */
  async load() {
    try {
      const items = await models.session
        .findAll({
          where: { record_status: 'A' },
          attributes: ['data', 'user_id']
        })
        .catch((e) => {
          throw e;
        });

      return items;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 
   * @returns 
   */
  async get() {
    try {
      const items = await models.session
        .findOne({
          where: { record_status: 'A', user_id: this.agentId },
          attributes: ['user_id']
        })
        .catch((e) => {
          throw e;
        });

      return items;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 
   * @param {*} ws 
   * @returns 
   */
  async update(ws) {
    try {
      const agentId = this.agentId;
      await models.session
        .update({ data: ws },
          {
            where: { user_id: agentId, record_status: 'A' },
            transaction: this.trx
          })
        .catch((e) => {
          throw e;
        });

      await this.trx.commit();
      return "OK"
    } catch (error) {
      await this.trx.rollback();
      throw error;
    }
  }

  /**
   * 
   * @returns 
   */
  async destroy() {
    try {
      const agentId = this.agentId;
      await models.session
        .update({ data: ws, record_status: 'N' },
          {
            where: { user_id: agentId, record_status: 'A' },
            transaction: this.trx
          })
        .catch((e) => {
          throw e;
        });

      await this.trx.commit();
      return "OK"
    } catch (error) {
      await this.trx.rollback();
      throw error;
    }
  }
}

module.exports = AuthController;
