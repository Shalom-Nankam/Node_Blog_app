const app = require("./app");
const db = require("./config/db.config");
const logger = require("./config/logger");

const PORT = process.env.PORT || 3000;

db.connect();

app.listen(process.env.PORT, () => {
  logger.info("==================> Server started successfully");
});
