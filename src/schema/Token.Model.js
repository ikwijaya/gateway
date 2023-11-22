const { DataTypes, Sequelize } = require("sequelize");
const { DB_SCHEMA } = require("../config");

module.exports = (sq) => {
  sq.define(
    "token",
    {
      token_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      channel_id: DataTypes.BIGINT,
      access_token: DataTypes.STRING,
      expires_in: DataTypes.STRING,
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
          fields: ['access_token']
        }
      ]
    }
  );
};
