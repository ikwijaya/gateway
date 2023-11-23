const { rabbitPub, rabbitSchema } = require("../broker");
const { ROUTE_SCHEMA_PATH } = require("../config");
const Ajv = require("ajv");
const fs = require("fs");

class RouteController {
  constructor(trx = null, route) {
    this.trx = trx;
    this.route = route;
    this.object = null;
  }

  validate(object) {
    try {
      const ajv = new Ajv();
      const validate = ajv.compile(rabbitSchema());
      const valid = validate(object);

      if (!valid) console.log(validate.errors);
      if (!valid)
        throw new Error(
          validate.errors.map((e) => `${e.dataPath} ${e.message}`)
        );
        
      this.object = object;
      return this;
    } catch (error) {
      throw error;
    }
  }

  log() {
    try {
      const info = {}
      info[this.route.queue] = new Date() 
      this.object['info'] = info

      return this
    } catch (error) {
      throw error;
    }
  }

  /**
   * please refer schema object from this docs: https://ajv.js.org/guide/getting-started.html
   * @param {*} object
   */
  async send() {
    try {
      const ajv = new Ajv();
      const queue = this.route.queue;
      const exchange = this.route.exchange;
      const object = this.object;

      if (!object) throw new Error("No request body to be send");
      if (!fs.existsSync(ROUTE_SCHEMA_PATH)) fs.mkdirSync(ROUTE_SCHEMA_PATH);
      const schema = fs.readFileSync(
        ROUTE_SCHEMA_PATH + this.route.file_schema,
        {
          encoding: "utf8",
          flag: "r",
        }
      );

      if (!schema) throw new Error(`Schema not found`);
      const validate = ajv.compile(JSON.parse(schema));
      const param = object.param;
      const valid = validate(param);

      if (!valid) console.log(validate.errors);
      if (!valid)
        throw new Error(
          validate.errors.map((e) => `${e.dataPath} ${e.message}`)
        );

      return await rabbitPub(queue, object).catch((error) => {
        throw error;
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = RouteController;
