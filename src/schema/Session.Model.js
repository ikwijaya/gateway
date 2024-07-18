const { DataTypes, Sequelize } = require("sequelize");
const { DB_SCHEMA } = require("../config");

module.exports = (sq) => {
  sq.define(
    "session",
    {
      session_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: DataTypes.STRING,
      ip_addr: DataTypes.STRING,
      token: DataTypes.TEXT,
      expires: DataTypes.DATE,
      data: DataTypes.JSONB,
      dcreate: {
        type: DataTypes.DATE,
        allowNull: false,
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
          fields: ['token']
        }
      ]
    }
  );
};
