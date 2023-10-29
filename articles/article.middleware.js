const joi = require("joi");
const passport = require("passport");
require("../config/passport_config")(passport);

const ValidateFullBody = async (req, res, next) => {
  try {
    const schema = joi.object({
      title: joi.string().required(),
      description: joi.string().required(),
      tags: joi.string().required(),
      state: joi.string().required(),
      body: joi.string().required(),
      author: joi.string().required(),
    });

    await schema.validateAsync(req.body, { abortEarly: true });

    next();
  } catch (error) {
    return res.status(422).json({
      message: error.message,
      success: false,
    });
  }
};

const ValidateAuth = async (req, res, next) => {
  try {
    passport.authenticate("jwt", { session: false });

    next();
  } catch (error) {
    return res.status(401).json({
      message: error.message,
      data: null,
    });
  }
};

const ValidateBlogsFetch = async (req, res, next) => {
  try {
    const schema = joi.object({
      user_id: joi.string(),
      blog_state: joi.string(),
      page: joi.string(),
    });

    await schema.validateAsync(req.body, { abortEarly: true });

    next();
  } catch (error) {
    return res.status(422).json({
      message: error.message,
      success: false,
    });
  }
};
const ValidateBlogUpdate = async (req, res, next) => {
  try {
    const schema = joi.object({
      _id: joi.string().required(),
      title: joi.string().required(),
      description: joi.string().required(),
      tags: joi.string().required(),
      state: joi.string().required(),
      body: joi.string().required(),
    });

    await schema.validateAsync(req.body, { abortEarly: true });

    next();
  } catch (error) {
    return res.status(422).json({
      message: error.message,
      success: false,
    });
  }
};

const ValidateBlogId = async (req, res, next) => {
  try {
    const schema = joi.object({
      blog_id: joi.string().required(),
    });

    await schema.validateAsync(req.body, { abortEarly: true });

    next();
  } catch (error) {
    res.status(422).json({
      message: error.message,
      success: false,
    });
  }
};

const ValidateSearchParams = async (req, res, next) => {
  try {
    const schema = joi.object({
      search_term: joi.string().required(),
      filter: joi.string(),
      is_user_blog: joi.string().required(),
      sorter: joi.string(),
      order: joi.string(),
    });

    await schema.validateAsync(req.body, { abortEarly: true });

    next();
  } catch (error) {
    return res.status(422).json({
      message: error.message,
      success: false,
    });
  }
};

module.exports = {
  ValidateFullBody,
  ValidateAuth,
  ValidateBlogsFetch,
  ValidateBlogUpdate,
  ValidateBlogId,
  ValidateSearchParams,
};
