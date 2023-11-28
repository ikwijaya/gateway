const Ajv = require("ajv");
const axios = require("axios").default;

const schema = {
  title: "shovel.schema",
  type: "object",
  properties: {
    component: { type: "string" },
    vhost: { type: "string" },
    name: { type: "string" },
    value: {
      type: "object",
      additionalProperties: true,
      properties: {
        "src-uri": { type: "string" },
        "src-protocol": { type: "string" },
        "src-queue": { type: "string" },
        "dest-uri": { type: "string" },
        "dest-protocol": { type: "string" },
        "dest-queue": { type: "string" },
        "ack-mode": { type: "string", default: "on-confirm" },
        "src-delete-after": { type: "string", default: "never" },
        "dest-add-timestamp-header": { type: "boolean", default: true },
      },
      required: ["src-uri", "src-queue", "dest-uri", "dest-queue"],
    },
  },
  required: ["component", "vhost", "name", "value"],
  additionalProperties: false,
};

class ShovelController {
  constructor(name = null, token = null, url = null) {
    this.shovel_name = name;
    this.shovel_value = null;
    this.baseUrl = url
      ? url
      : "http://127.0.0.1:15672/api/parameters/shovel/%2f/";

    if (!token) throw new Error("No credential");
    this.token = Buffer.from(token).toString("base64");
    this.headers = {
      Authorization: "Basic " + this.token,
      "Content-Type": "application/json",
    };
  }

  validate(value = null) {
    try {
      this.shovel_value = value;
      if (!this.shovel_value) throw new Error("body cannot be null");
      if (!schema) throw new Error(`Schema not found`);

      const ajv = new Ajv();
      const validate = ajv.compile(schema);

      const param = this.shovel_value;
      const valid = validate(param);

      if (!valid) logger(`SHOVEL`, `validate`, validate.errors);
      if (!valid)
        throw new Error(
          validate.errors.map((e) => `${e.dataPath} ${e.message}`)
        );

      return this;
    } catch (error) {
      throw error;
    }
  }

  async run() {
    try {
      const value = this.shovel_value;
      return await axios
        .put(this.baseUrl + this.shovel_name, value, {
          headers: this.headers,
        })
        .catch((e) => {
          throw e;
        });
    } catch (error) {
      throw error;
    }
  }

  async check() {
    try {
      return await axios
        .get(this.baseUrl + this.shovel_name, { headers: this.headers })
        .catch((e) => {
          throw e;
        });
    } catch (error) {
      throw error;
    }
  }

  async restart() {
    try {
      return await axios
        .delete(this.baseUrl + this.shovel_name + "/restart", {
          headers: this.headers,
        })
        .catch((e) => {
          throw e;
        });
    } catch (error) {
      throw error;
    }
  }

  async delete() {
    try {
      return await axios
        .delete(this.baseUrl + this.shovel_name, { headers: this.headers })
        .catch((e) => {
          throw e;
        });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ShovelController;
