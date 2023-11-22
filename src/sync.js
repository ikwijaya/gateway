const sq = require("./db");
const { SQ_ALTER, SQ_FORCE, SQ_INIT } = require("./config");
var msg = [];

const authenticate = async () => {
  try {
    await sq.authenticate();
    console.log("🚀 yey! your database is connected to me.");
  } catch (err) {
    console.error("sorry, something wrong with your connection: ", err);
  }
};

const run = async () => {
  try {
    msg = [
      { message: `${SQ_FORCE == true ? "FORCE is running" : null}` },
      { message: `${SQ_ALTER == true ? "ALTER is running" : null}` },
    ];
    console.table(
      "🚀 sync-is-running",
      msg.filter((e) => e.message)
    );
    await sq
      .sync({
        alter: SQ_ALTER == true || SQ_ALTER == "true",
        force: SQ_FORCE == true || SQ_FORCE == "true",
        logging: (msg) => {
          console.log(`🚀 sync.js => `, msg);
          if (typeof msg === "object") LogModel.logging(JSON.stringify(msg));
        },
      })
      .then((r) => console.table("sync", [r]))
      .catch((e) => {
        console.log(`error => `, e);
        throw e;
      });

    if (SQ_FORCE == true || SQ_FORCE == "true")
      Promise.all([])
        .then((r) => console.table("force processed", r))
        .catch((e) => {
          throw e;
        });
  } catch (error) {
    msg.push({ message: `error : ${error}` });
    console.table(msg.filter((e) => e.message));
  }
};

authenticate();
run();
