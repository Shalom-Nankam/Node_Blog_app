const express = require("express");
const middlware = require("./article.middleware");
const controller = require("./articles.controller");

const router = express.Router();

router.get("/", middlware.ValidateBlogsFetch, controller.GetBlogs);

router.post(
  "/create",
  middlware.ValidateFullBody,
  middlware.ValidateAuth,
  controller.CreateBlog
);

router.post(
  "/edit",
  middlware.ValidateBlogUpdate,
  middlware.ValidateAuth,
  controller.UpdateBlog
);

router.delete(
  "/delete",
  middlware.ValidateBlogId,
  middlware.ValidateAuth,
  controller.DeleteBlog
);

router.get("/fetch", middlware.ValidateBlogId, controller.GetSingleBlog);

router.post("/search", middlware.ValidateSearchParams, controller.SearchBlogs);

module.exports = router;
