const express = require("express");
const middlware = require("./user.middleware");
const controller = require("./user.controller");

const router = express.Router();

router.post("/login", middlware.LoginValidation, controller.LoginUser);

router.post("/register", middlware.ValidateUserCreation, controller.CreateUser);

router.post("*", (req, res) => {
  res.status(404).json({
    message: "Resource not found!",
  });
});

module.exports = router;
