const db = require("../src/db");

db.initialize({ seedDemo: true })
  .then(() => console.log("Database migrations and explicit demo seed data are ready."))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.pool.end());
