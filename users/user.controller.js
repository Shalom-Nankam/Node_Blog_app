const jwt = require("jsonwebtoken");
const logger = require("../config/logger");
const UserModel = require("./users.model");

require("dotenv").config();

const LoginUser = async (req, res) => {
  logger.info("===========> Logging user in");
  try {
    const user = req.body;

    const existingUser = await UserModel.findOne({ email: user.email });

    if (!existingUser) {
      logger.info("===========> Did not find user");

      return res.status(422).json({
        message: "User not found",
        data: null,
      });
    }
    const validPass = await existingUser.isValidPassword(user.password);
    if (!validPass) {
      logger.info("===========> Entered a wrong password");

      return res.status(422).json({
        message: "Incorrect password.",
        data: null,
      });
    }
    const token = await jwt.sign(
      {
        email: user.email,
        _id: existingUser._id,
        first_name: existingUser.first_name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    logger.info("===========> user logged in successfully");
    delete existingUser.password;
    return res.status(200).json({
      message: "Logged in successfully",
      user: existingUser,
      token: token,
    });
  } catch (error) {
    logger.error("============> error logging user in: " + error.message);
    return res.status(500).json({
      message: "Internal Server error",
      data: null,
    });
  }
};

const CreateUser = async (req, res) => {
  logger.info("=====================> creating user ");
  try {
    const user = req.body;
    const existingUser = await UserModel.findOne({ email: user.email });

    if (existingUser) {
      logger.info("=====================> user already exists");

      return res.status(409).json({
        message: "User already exists.",
        data: null,
      });
      s;
    }
    const createdUser = await UserModel.create({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      password: user.password,
    });
    logger.info("==================> Created user successfully");

    delete createdUser.password;

    return res.status(201).json({
      message: "User created successfully",
      data: createdUser,
    });
  } catch (error) {
    logger.error("===============> error in creating user" + error.message);
    return res.status(500).json({
      message: "Internal server error",
      data: null,
    });
  }
};

module.exports = {
  LoginUser,
  CreateUser,
};
