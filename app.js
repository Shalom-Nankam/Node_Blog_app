const express = require("express");
const morgan = require("morgan");
const viewsRouter = require("./views/view.router");
require("dotenv").config();
const logger = require("./config/logger");
const path = require("path");

const db = require("./config/db.config");

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("views"));

app.set("view engine", "ejs");

app.use("/views", viewsRouter);

db.connect();

app.listen(process.env.PORT, () => {
  logger.info("==================> Server started successfully");
});
