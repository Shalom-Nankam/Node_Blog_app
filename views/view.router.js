const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const articleService = require("../articles/article.service");
const userService = require("../users/user.service");

require("dotenv").config();

const router = express.Router();

router.use(cookieParser());

router.get("/", (req, res) => {
  res.redirect("/views/home");
});

router.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});

router.post("/signup", async (req, res) => {
  const newUser = await userService.CreateUser(req.body);
  if (newUser.code === 201) {
    res.redirect("/views/login");
  } else {
    res.render("signup", { error: newUser.message });
  }
});

router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

router.post("/login", async (req, res) => {
  const response = await userService.Login({
    email: req.body.email,
    password: req.body.password,
  });

  if (response.code === 200) {
    res.cookie("jwt", response.token);
    res.locals.user = response.user;

    res.redirect("/views/home?");
  } else {
    res.render("index", { error: response.message });
  }
});

router.use(async (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    try {
      const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
      res.locals.user = decodedToken;
    } catch (error) {}
  }
  next();
});

router.get("/home", async (req, res) => {
  const page = req.query.page;
  const userId = req.query.user_id;
  const allBlogs = await articleService.GetBlogs(page, userId, "Published");
  if (allBlogs.code === 200) {
    res.render("home", {
      data: allBlogs.data,
      user: res.locals.user ? res.locals.user : null,
      error: null,
    });
  } else {
    res.render("home", {
      data: null,
      user: res.locals.user ? res.locals.user : null,
      error: allBlogs.message,
    });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/views/home");
});

router.get("/blogs/create", (req, res) => {
  res.render("createBlog", { user: res.locals.user, error: null });
});

router.post("/blogs/create", async (req, res) => {
  const blogInfo = req.body;
  const blogCreateResp = await articleService.CreateBlog(blogInfo);
  if (blogCreateResp.code === 201) {
    res.redirect("/views/blogs/user");
  } else {
    res.render("createBlog", {
      user: res.locals.user,
      error: blogCreateResp.message,
    });
  }
});

router.get("/blogs/edit", async (req, res) => {
  const blogId = req.query.id;
  const blog = await articleService.GetSingleBlog(blogId, res.locals.user._id);
  const finalTags = blog.data.tags.join(" ");
  if (blog.code === 200) {
    res.render("editBlog", {
      user: res.locals.user,
      blog: blog.data,
      defaultTags: finalTags,
      error: null,
    });
  }
});
router.post("/blogs/edit", async (req, res) => {
  let newBlog = req.body;
  const finalState =
    newBlog.state === "Publish article" ? "Published" : "Draft";
  newBlog.state = finalState;
  const blog = await articleService.UpdateBlog(newBlog);
  if (blog.code === 201) {
    res.redirect("/views/home");
  } else {
    res.render("editBlog", {
      user: res.locals.user,
      blog: blog.data,
      error: blog.message,
      å,
    });
  }
});

router.post("/blogs/delete", async (req, res) => {
  const blogId = req.body;
  const deletedBlog = await articleService.DeleteBlog(
    blogId.id,
    res.locals.user._id
  );
  if (deletedBlog.code === 201) {
    res.redirect("/views/blogs/user");
  } else {
    res.render("singleBlog", {
      blog: deletedBlog.data,
      error: deletedBlog.message,
      is_author: deletedBlog.is_author,
    });
  }
});

router.get("/blogs/fetch", async (req, res) => {
  const blogId = req.query.id;
  const userId = res.locals.user ? res.locals.user._id : "";
  const blog = await articleService.GetSingleBlog(blogId, userId);
  if (blog.code === 200) {
    res.render("singleBlog", {
      blog: blog.data,
      is_author: blog.is_author,
      error: null,
    });
  } else {
    res.redirect("/views/home");
  }
});

router.get("/blogs/user", async (req, res) => {
  const user_id = res.locals.user._id;
  const page = req.query.page;
  userBlogs = await articleService.GetBlogs(page, user_id);
  if (userBlogs.code === 200) {
    res.render("userBlogs", { data: userBlogs.data, error: null });
  } else {
    res.redirect("/views/home");
  }
});

router.post("/blogs/search", async (req, res) => {
  const queryParams = req.body;

  console.log({ queryParams });

  const isUserBlogs = req.body.isUser == "true" ? true : false;

  const matchingBlogs = await articleService.SearchBlogs(
    queryParams.page,
    queryParams.search,
    queryParams.filter,
    queryParams.sorter,
    queryParams.order,
    isUserBlogs,
    res.locals.user._id
  );

  if (matchingBlogs.code === 200) {
    res.render("searchResults", {
      data: matchingBlogs.data,
      error: null,
      is_user_blogs: isUserBlogs,
      query: queryParams,
    });
  } else {
    res.redirect("/view/home");
  }
});

module.exports = router;
