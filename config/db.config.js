const mongoose = require("mongoose");

const logger = require("./logger");
require("dotenv").config();

const connect = async () => {
  mongoose.connect(process.env.MONGO_DB_URL);

  mongoose.connection.on("connected", () => {
    logger.info("Database connected successfully");
  });

  mongoose.connection.on("error", (err) => {
    logger.error("Error with database connection" + err.toString());
  });
};

module.exports = {
  connect,
};
