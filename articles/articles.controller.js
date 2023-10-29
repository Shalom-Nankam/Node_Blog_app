const ArticleModel = require("./article.model");
const logger = require("../config/logger");

const CreateBlog = async (req, res) => {
  logger.info("=====================> creating new blog ");
  const blog = req.body;
  try {
    const existingblog = await ArticleModel.findOne({
      title: blog.title,
    }).exec();

    const finalState = blog.state == "Publish article" ? "Published" : "Draft";
    const finalTags = blog.tags.split(" ");

    if (existingblog) {
      logger.info("=====================> blog already exists");

      return res.status(409).json({
        message: "Blog already exists.",
        data: null,
      });
      s;
    }

    const createdBlog = await ArticleModel.create({
      title: blog.title,
      state: finalState,
      tags: finalTags,
      body: blog.body,
      author: blog.author,
      description: blog.description,
    });
    logger.info("==================> Created blog successfully");
    return res.status(201).json({
      message: "Blog created successfully",
      data: createdBlog,
    });
  } catch (error) {
    logger.error("===============> error in creating blog" + error.message);
    return res.status(500).json({
      message: "Internal server error",
      data: null,
    });
  }
};

const GetBlogs = async (req, res) => {
  logger.info("===============> getting all blogs");

  const blogDetails = req.body;

  const queryOptions = {};
  if (blogDetails.user_id) {
    queryOptions.author = blogDetails.user_id;
  }
  if (blogDetails.blog_state) {
    queryOptions.state = blogDetails.blog_state;
  }

  try {
    const blogs = await ArticleModel.paginate(queryOptions, {
      page: blogDetails.page ? blogDetails.page : 1,
      limit: 20,
      populate: "author",
    });

    if (!blogs) {
      logger.info("===============> did not find blogs for user");
      return res.status(200).json({
        message: "No blogs found",
        data: null,
      });
    }

    logger.info("===============> succesfully fetched blogs");

    return res.status(200).json({
      message: "Blogs fetched successfully",
      data: {
        blogs: blogs.docs,
        hasNextPage: blogs.hasNextPage,
        nextPage: blogs.nextPage,
        hasPrevPage: blogs.hasPrevPage,
        prevPage: blogs.prevPage,
      },
    });
  } catch (error) {
    logger.error(
      "==================> error with getting blogs " + error.message
    );
    return res.status(500).json({
      message: error.message,
      data: null,
    });
  }
};

const UpdateBlog = async (req, res) => {
  const blogInfo = req.body;
  logger.info("==================> updating blog: " + blogInfo._id);
  try {
    const updateBlog = await ArticleModel.findByIdAndUpdate(
      blogInfo._id,
      {
        state: blogInfo.state,
        description: blogInfo.description,
        title: blogInfo.title,
        tags: blogInfo.tags,
        body: blogInfo.body,
      },
      {
        returnDocument: "after",
      }
    );
    if (!updateBlog) {
      logger.info("==================> error finding blog: " + blogInfo._id);

      return res.status(404).json({
        message: "Could not find blog to update",
        data: null,
      });
    }
    logger.info("==================> updated blog: " + blogInfo._id);

    return res.status(201).json({
      message: "Blog successfully updated",
      data: updateBlog,
    });
  } catch (error) {
    logger.error("==================> error updating blog: " + error.message);
    return res.status(500).json({
      message: error.message,
      data: null,
    });
  }
};

const DeleteBlog = async (req, res) => {
  const id = req.body.blog_id;
  logger.info("===============> deleting blog :" + id);

  try {
    const deletedBlog = await ArticleModel.findOneAndDelete({
      _id: id,
    });

    if (!deletedBlog) {
      logger.info("===============> could not find or delete blog");

      return res.status(422).json({
        message: "Could not delete blog",
        data: null,
      });
    }

    logger.info("===============> succesfully deleted blog");

    return res.status(200).json({
      message: "Blog successfully deleted",
      data: deletedBlog,
    });
  } catch (error) {
    logger.error(
      "==================> error with deleting blog" + error.message
    );
    return res.status(500).json({
      message: error.message,
      data: null,
    });
  }
};

const GetSingleBlog = async (req, res) => {
  const blogInfo = req.body;
  logger.info("===================> Getting single blog:" + blogInfo.blog_id);

  try {
    const blog = await ArticleModel.findById(blogInfo.blog_id)
      .populate("author")
      .exec();
    if (!blog) {
      logger.info(
        "================> error getting single blog: " + blogInfo.blog_id
      );
      return res.status(404).json({
        message: "Could not find blog",
        data: null,
      });
    }
    logger.info("================> retrieved blog successfully: ");
    return res.status(200).json({
      message: "Blog retrieved successfully",
      data: blog,
    });
  } catch (error) {
    logger.error(
      "================> error getting single blog: " + error.message
    );
    return res.status(500).json({
      message: error.message,
      data: null,
    });
  }
};

const SearchBlogs = async (req, res) => {
  const queryParams = req.body;
  logger.info("==============> searching blogs for " + queryParams.search_term);
  let regex = new RegExp(queryParams.search_term, "i");
  const queryOptions = {
    $or: [{ title: regex }, { tags: regex }],
  };
  if (queryParams.filter && queryParams.filter != "All") {
    queryOptions.state = queryParams.filter;
  }
  if (queryParams.is_user_blogs === "true") {
    queryOptions.author = queryParams.user_id;
  }
  console.log({ queryOptions });

  const sorter = queryParams.sorter;
  const order = queryParams.order;

  const matches = await ArticleModel.paginate(queryOptions, {
    page: queryParams.page ? page : 1,
    limit: 20,
    populate: "author",
    sort: sorter ? { sorter: order } : {},
  });

  logger.info("===============> succesfully matched blogs");

  console.log({ matches });

  return res.status(200).json({
    data: {
      blogs: matches.docs,
      hasNextPage: matches.hasNextPage,
      nextPage: matches.nextPage,
      hasPrevPage: matches.hasPrevPage,
      prevPage: matches.prevPage,
    },
    message: "Blogs searched successfully",
  });
};

module.exports = {
  CreateBlog,
  GetBlogs,
  UpdateBlog,
  DeleteBlog,
  GetSingleBlog,
  SearchBlogs,
};
