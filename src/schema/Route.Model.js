const { DataTypes, Sequelize } = require("sequelize");
const { DB_SCHEMA } = require("../config");

/**
 * jadi dari depan akan bawa 
 * {
 *    action: <String>,
 *    params: <Object>,
 *    reqId: <String>,
 *    timestamp: <Date>,
 *    response: <Object>
 * }
 * 
 * msg-broker:
 * 1. in.queue
 * 2. out.queue (untuk response, baik itu error or success)
 * 3. log.queue
 * 4. ml.queue
 * 5. bucket.queue
 * 
 * @abstract
 * action as url_path. Dari sini akan menentukan kemana data akan di kirim ke msg-broker
 * params as request object based on queue. return error akan disampaikan dari msg-broker ke queue (out.queue)
 */
module.exports = (sq) => {
  sq.define(
    "route",
    {
      route_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,

      /// url is action
      url_path: DataTypes.STRING,
      exchange: DataTypes.STRING,
      queue: DataTypes.STRING,
      schema: DataTypes.TEXT,
      from_schema: {
        type: DataTypes.ENUM('file','json','api'),
        defaultValue: 'json'
      },

      dcreate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      ucreate: {
        type: DataTypes.BIGINT,
      },
      dmodified: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      umodified: {
        type: DataTypes.BIGINT,
      },
      record_status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      schema: DB_SCHEMA,
      freezeTableName: true,
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['url_path']
        }
      ]
    }
  );
};
