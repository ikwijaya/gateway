const { DataTypes, Sequelize } = require("sequelize");
const { DB_SCHEMA } = require("../config");

module.exports = (sq) => {
  sq.define(
    "access",
    {
      access_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      route_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      channel_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      grant: DataTypes.BOOLEAN,
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
      indexes: []
    }
  );
};
