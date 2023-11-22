const app = require("express").Router();
const { CROSS_ORIGIN } = require("../config");

app.use(
  require("cors")({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (CROSS_ORIGIN.indexOf(origin) === -1)
        return callback(
          new Error(
            `The CORS policy for this site does not allow access from specified Origin`
          ),
          false
        );

      return callback(null, true);
    },
  })
);

//// route /v1
app.use("/v1", require("./create-token"));
app.use("/v1", require("./validate-token"));
app.use("/v1", require("./inbound"));

module.exports = app;
