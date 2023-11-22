/**
 * Relasi tiap-tiap table di definisikan disini
 * @param {*} sq
 * sql server ref aggregateError when 1tomany
 * https://learn.microsoft.com/en-us/sql/relational-databases/errors-events/mssqlserver-1785-database-engine-error?view=sql-server-ver16
 */

function assoc(sq) {
  const { access, channel, route, token } = sq.models;

  // create associations/relationship
  channel.hasMany(access, { foreignKey: { name: "channel_id" } });
  access.belongsTo(channel, { foreignKey: { name: "channel_id" } });

  route.hasMany(access, { foreignKey: { name: "route_id" } });
  access.belongsTo(route, { foreignKey: { name: "route_id" } });

  channel.hasMany(token, { foreignKey: { name: "channel_id" } });
  token.belongsTo(channel, { foreignKey: { name: "channel_id" } });
}

module.exports = {
  assoc,
};
