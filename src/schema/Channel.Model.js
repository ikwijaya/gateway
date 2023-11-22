const { DataTypes, Sequelize } = require("sequelize");
const { DB_SCHEMA } = require("../config");

module.exports = (sq) => {
  sq.define(
    "channel",
    {
      channel_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
      author: DataTypes.STRING,
      
      app_key: DataTypes.STRING,
      secret_key: DataTypes.STRING,
      
      webhook: DataTypes.STRING,
      webhook_key: DataTypes.STRING,
      webhook_value: DataTypes.STRING,
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
          fields: ['app_key']
        }
      ]
    }
  );
};
