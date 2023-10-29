const mongoose = require("mongoose");
const shortid = require("shortid");
const mongoosePaginate = require("mongoose-paginate-v2");

const Schema = mongoose.Schema;

const ArticleSchema = new Schema(
  {
    _id: {
      type: String,
      default: shortid.generate,
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    state: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },
    tags: [String],
    body: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      ref: "User",
    },
    reading_time: {
      type: Number,
      default: 0,
    },
    read_count: {
      type: Number,
      default: 0,
    },
  },
  {
    collection: "articles",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

ArticleSchema.pre("save", async function (next, doc) {
  const wpm = 225;
  const words = this.body.trim().split(/\s+/).length;
  const time = Math.ceil(words / wpm);
  this.reading_time = time;
  next();
});

ArticleSchema.pre("insertMany", async function (next, docs) {
  try {
    docs.map(async function (doc) {
      const wpm = 225;
      const words = doc.body.trim().split(/\s+/).length;
      const time = Math.ceil(words / wpm);
      doc.reading_time = time;

      const tag = doc.tags.split(" ");
      doc.tags = tag;
    });
  } catch (error) {}

  next();
});

ArticleSchema.post("findOne", function (doc, next) {
  if (doc) {
    doc.read_count += 1;
    doc.save();
  }

  next();
});

ArticleSchema.methods.isAuthor = function (id) {
  return this.author === id;
};

ArticleSchema.methods.formatDate = function () {
  var Months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${Months[this.created_at.getMonth()]} ${this.created_at.getDate()}`;
};
ArticleSchema.plugin(mongoosePaginate);

const Article = mongoose.model("Article", ArticleSchema, "Article");

module.exports = Article;
