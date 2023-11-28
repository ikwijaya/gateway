const { rabbitPub, rabbitSchema } = require("../broker");
const { ROUTE_SCHEMA_PATH } = require("../config");
const Ajv = require("ajv");
const fs = require("fs");
const axios = require("axios").default;
const { logger } = require("../helper");

//// route.from_schema = ['file', 'json', 'api']
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

      if (!valid) logger(`ROUTE`, `validate`, validate.errors);
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
      const info = {};
      info[this.route.queue] = new Date();
      this.object["info"] = info;

      return this;
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
      const schemaFrom = this.route.from_schema;
      const schemaValue = this.route.schema;
      const exchange = this.route.exchange;
      const object = this.object;
      let schema = null;

      if (!object) throw new Error("No request body to be send");
      if (!schemaValue) throw new Error(`Schema/Model not found`);
      switch (schemaFrom) {
        case "file":
          if (!fs.existsSync(ROUTE_SCHEMA_PATH))
            fs.mkdirSync(ROUTE_SCHEMA_PATH);
          schema = fs.readFileSync(ROUTE_SCHEMA_PATH + schemaValue, {
            encoding: "utf8",
            flag: "r",
          });
          break;

        case "json":
          schema = schemaValue;
          break;

        case "api":
          const res = await axios.get(schemaValue).catch((e) => {
            throw e;
          });
          schema = res.status == 200 ? res.data : null;
          if (typeof schema === "object") schema = JSON.stringify(schema);
          break;

        default:
          break;
      }

      if (!schema) throw new Error(`Schema not found`);
      const validate = ajv.compile(JSON.parse(schema));
      const param = object.param;
      const valid = validate(param);

      if (!valid) logger(`ROUTE`, `send`, validate.errors);
      if (!valid)
        throw new Error(
          validate.errors.map((e) => `param ${e.dataPath} ${e.message}`)
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
