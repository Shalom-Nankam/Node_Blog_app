const ArticleModel = require("./article.model");
const logger = require("../config/logger");
const { search } = require("../views/view.router");

const CreateBlog = async (blog) => {
  logger.info("=====================> creating new blog ");
  try {
    const existingblog = await ArticleModel.findOne({
      title: blog.title,
    }).exec();

    const finalState = blog.state == "Publish article" ? "Published" : "Draft";
    const finalTags = blog.tags.split(" ");

    if (existingblog) {
      logger.info("=====================> blog already exists");

      return {
        message: "Blog already exists.",
        data: null,
        code: 409,
      };
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
    return {
      message: "Blog created successfully",
      data: createdBlog,
      code: 201,
    };
  } catch (error) {
    logger.error("===============> error in creating blog" + error.message);
    return {
      message: "Internal server error",
      data: null,
      code: 500,
    };
  }
};

const GetBlogs = async (page, id, blogState) => {
  logger.info("===============> getting all blogs for user: " + id);

  const queryOptions = {};
  if (id) {
    queryOptions.author = id;
  }
  if (blogState) {
    queryOptions.state = blogState;
  }

  try {
    const blogs = await ArticleModel.paginate(queryOptions, {
      page: page ? page : 1,
      limit: 10,
      populate: "author",
    });

    if (!blogs) {
      logger.info("===============> did not find blogs for user" + id);
      return {
        message: "Did not find any blog for this user",
        data: blogs,
        code: 201,
      };
    }

    logger.info("===============> succesfully fetched blogs");

    return {
      message: "Blogs fetched successfully",
      code: 200,
      data: {
        blogs: blogs.docs,
        hasNextPage: blogs.hasNextPage,
        nextPage: blogs.nextPage,
        hasPrevPage: blogs.hasPrevPage,
        prevPage: blogs.prevPage,
      },
    };
  } catch (error) {
    logger.error(
      "==================> error with getting blogs " + error.message
    );
    return {
      message: "An error occured",
      code: 500,
      data: null,
    };
  }
};

const UpdateBlog = async (blog) => {
  logger.info("==================> updating blog: " + blog._id);
  console.log({ blog });
  try {
    const updateBlog = await ArticleModel.findByIdAndUpdate(
      blog._id,
      {
        state: blog.state,
        description: blog.description,
        title: blog.title,
        tags: blog.tags,
        body: blog.body,
      },
      {
        returnDocument: "after",
      }
    );
    if (!updateBlog) {
      logger.info("==================> error finding blog: " + blog._id);

      return {
        message: "Could not find blog to update",
        code: 404,
        data: null,
      };
    }
    logger.info("==================> updated blog: " + blog._id);

    return {
      message: "Blog successfully updated",
      code: 201,
      data: updateBlog,
    };
  } catch (error) {
    logger.error("==================> error updating blog: " + error.message);
    return {
      code: 500,
      message: error.message,
      data: null,
    };
  }
};

const DeleteBlog = async (id, userId) => {
  logger.info("===============> deleting blog :" + id);

  try {
    const deletedBlog = await ArticleModel.findOneAndDelete({
      _id: id,
    });

    if (!deletedBlog) {
      logger.info("===============> could not find or delete blog");

      return {
        message: "Could not delete blog",
        data: null,
        code: 500,
      };
    }

    logger.info("===============> succesfully deleted blog");

    const isAuthor = deletedBlog.author._id === userId;

    return {
      message: "Blog successfully deleted",
      code: 201,
      data: deletedBlog,
      is_author: isAuthor,
    };
  } catch (error) {
    logger.error(
      "==================> error with deleting task" + error.message
    );
    return {
      message: "An error occured",
      code: 500,
      data: null,
    };
  }
};

const GetSingleBlog = async (id, userId) => {
  logger.info("===================> Getting single blog:" + id);

  try {
    const blog = await ArticleModel.findById(id).populate("author").exec();
    if (!blog) {
      logger.info("================> error getting single blog: " + id);
      return {
        code: 404,
        message: "Could not find blog",
        data: null,
      };
    }
    const isAuthor = blog.author._id === userId;
    logger.info("================> retrieved blog successfully: " + id);
    return {
      code: 200,
      message: "Blog retrieved successfully",
      data: blog,
      is_author: isAuthor,
    };
  } catch (error) {
    logger.error(
      "================> error getting single blog: " + error.message
    );
    return {
      code: 500,
      message: "An error occured",
      data: null,
    };
  }
};

const SearchBlogs = async (
  page,
  searchTerm,
  filter,
  sorter,
  order,
  isUser,
  userId
) => {
  logger.info("==============> searching blogs for " + searchTerm);
  let regex = new RegExp(searchTerm, "i");
  const queryOptions = {
    $or: [{ title: regex }, { tags: regex }],
  };
  if (filter && filter != "All") {
    queryOptions.state = filter;
  }
  if (isUser) {
    queryOptions.author = userId;
  }
  console.log({ queryOptions });

  console.log({ sorter, order });

  const matches = await ArticleModel.paginate(queryOptions, {
    page: page ? page : 1,
    limit: 10,
    populate: "author",
    sort: sorter ? { sorter: order } : {},
  });

  logger.info("===============> succesfully matched blogs");

  console.log({ matches });

  return {
    code: 200,
    data: {
      blogs: matches.docs,
      hasNextPage: matches.hasNextPage,
      nextPage: matches.nextPage,
      hasPrevPage: matches.hasPrevPage,
      prevPage: matches.prevPage,
    },
    message: "Blogs search successfully",
  };
};

const paginateFunction = (page, limit) => {
  const offset = page ? page * limit : 0;

  return offset;
};

module.exports = {
  CreateBlog,
  GetBlogs,
  UpdateBlog,
  DeleteBlog,
  GetSingleBlog,
  SearchBlogs,
};
