const { DataTypes, Sequelize } = require("sequelize");
const { DB_SCHEMA } = require("../config");

module.exports = (sq) => {
  sq.define(
    "response",
    {
      res_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      status: DataTypes.INTEGER,
      url: DataTypes.TEXT,
      req: DataTypes.TEXT,
      res: DataTypes.TEXT,
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
    }
  );
};
