const { models } = require("../db");
const crypto = require("crypto");
const sequelize = require('../db')

class AuthController {
  /**
   * 
   * @param {*} agentId 
   * @param {*} ipAddr 
   * @returns 
   */
  async login(agentId = null, ipAddr = null) {
    const trx = await sequelize.transaction().catch(e => { throw (e) })
    try {
      if (!agentId || !ipAddr) throw { rawMessages: ["Error cannot found IP Address or Agent ID"] }
      const find = await models.session.findOne(
        {
          attributes: ['session_id', 'data'],
          where: { ip_addr: ipAddr, record_status: 'A' },
          transaction: trx
        }
      ).catch(e => { throw e })

      if(!find) throw { rawMessages: ["Error cannot found the socket ready, please re-run the agent"] }
      await models.session
        .update({ user_id: agentId },
          {
            where: { session_id: find.getDataValue('session_id') },
            transaction: trx
          })
        .catch((e) => {
          throw e;
        });

      await trx.commit();
      return { messages: ["OK"], payload: { ipAddr, agentId, ws: find.getDataValue('data') } }
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  /**
   * 
   * @param {*} ipAddr 
   * @param {*} ws 
   * @returns 
   */
  async connect(ipAddr = null, ws = null) {
    const trx = await sequelize.transaction().catch(e => { throw (e) })
    try {
      const accessToken = crypto.randomBytes(32).toString("hex");
      if (!ipAddr || !ws) throw { rawMessages: ["Error cannot found IP Address or socket Map"] }

      //// destroy last login
      await models.session
        .update({ record_status: 'N', data: ws },
          {
            where: { ip_addr: ipAddr, record_status: 'A' },
            transaction: trx
          })
        .catch((e) => {
          throw e;
        });

      //// recreate new session
      await models.session
        .create({
          dcreate: new Date(),
          token: accessToken,
          ip_addr: ipAddr,
          record_status: 'A',
          data: ws
        }, { transaction: trx })
        .catch((e) => {
          throw e;
        });

      await trx.commit();
      return { messages: ["OK"], payload: { ipAddr } }
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  /**
   * 
   * @param {*} agentId 
   * @returns 
   */
  async getByAgentId(agentId = null) {
    try {
      const items = await models.session
        .findOne({
          where: { record_status: 'A', user_id: agentId },
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
   * @param {*} ipAddr 
   * @returns 
   */
  async getByIpAddr(ipAddr = null) {
    try {
      const items = await models.session
        .findOne({
          where: { record_status: 'A', ip_addr: ipAddr },
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
   * @param {*} agentId 
   * @param {*} ipAddr 
   * @returns 
   */
  async destroy(ipAddr = null) {
    const trx = await sequelize.transaction().catch(e => { throw (e) })
    try {
      if (!ipAddr) throw { rawMessages: ["Error cannot found IP Address"] }
      await models.session
        .update({ record_status: 'N' },
          {
            where: { ip_addr: ipAddr, record_status: 'A' },
            transaction: trx
          })
        .catch((e) => {
          throw e;
        });

      await trx.commit();
      return { messages: ["OK"], payload: { ipAddr } }
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  /**
   * 
   * @returns 
   */
  async loadAll() {
    try {
      const items = await models.session
        .findAll({
          where: { record_status: 'A' },
          attributes: ['user_id', 'ip_addr']
        })
        .catch((e) => {
          throw e;
        });

      return items;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthController;
