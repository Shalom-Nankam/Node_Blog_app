const UserModel = require("./users.model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const logger = require("../config/logger");

const CreateUser = async (userToRegister) => {
  logger.info("=====================> creating user ");
  try {
    const user = userToRegister;
    const existingUser = await UserModel.findOne({ email: user.email });

    if (existingUser) {
      logger.info("=====================> user already exists");

      return {
        message: "User already exists.",
        data: null,
        code: 409,
      };
    }
    const createdUser = await UserModel.create({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      password: user.password,
    });
    logger.info("==================> Created user successfully");
    return {
      message: "User created successfully",
      data: createdUser,
      code: 201,
    };
  } catch (error) {
    logger.error("===============> error in creating user" + error.message);
    return {
      message: "Internal server error",
      data: null,
      code: 500,
    };
  }
};

const Login = async ({ email, password }) => {
  logger.info("===========> Logging user in");
  try {
    const user = { email, password };

    const existingUser = await UserModel.findOne({ email: user.email });

    if (!existingUser) {
      logger.info("===========> Did not find user");

      return {
        message: "User not found",
        data: null,
        code: 422,
      };
    }
    const validPass = await existingUser.isValidPassword(user.password);
    if (!validPass) {
      logger.info("===========> Entered a wrong password");

      return {
        message: "Incorrect password.",
        data: null,
        code: 422,
      };
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
    return {
      message: "Logged in successfully",
      user: existingUser,
      token: token,
      code: 200,
    };
  } catch (error) {
    logger.error("============> error logging user in: " + error.message);
    return {
      message: "Internal server error",
      data: null,
      code: 500,
    };
  }
};

const getUser = async function (userInfo) {
  try {
    logger.info("==================> fetching user info");

    const user = await UserModel.findOne({ email: userInfo.email });

    if (!user) {
      logger.info("========================> could not find user");
      return {
        code: 404,
        message: "Could not find user",
        data: null,
      };
    }
    logger.info("========================> found user");
    return {
      code: 200,
      message: "User found",
      data: user,
    };
  } catch (error) {
    logger.info("========================> error finding user");
    return {
      message: "Error occured in retrieving user",
      code: 500,
      data: null,
    };
  }
};

module.exports = {
  CreateUser,
  Login,
  getUser,
};
