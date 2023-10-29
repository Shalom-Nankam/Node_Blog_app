const express = require("express");
const morgan = require("morgan");
const viewsRouter = require("./views/view.router");
const userRouter = require("./users/user.router");
const blogRouter = require("./articles/article.router");
const passport = require("passport");
require("./config/passport_config")(passport);
require("dotenv").config();

const db = require("./config/db.config");

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("views"));
app.use(passport.initialize());

app.set("view engine", "ejs");

app.use("/views", viewsRouter);

app.use("/user", userRouter);
app.use(
  "/blogs/user",
  passport.authenticate("jwt", { session: false }),
  blogRouter
);
app.use("/blogs", blogRouter);

module.exports = app;
