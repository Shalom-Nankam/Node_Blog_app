const mongoose = require("mongoose");
const shortid = require("shortid");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    _id: {
      type: String,
      default: shortid.generate,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    collection: "users",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

UserSchema.virtual("blogs", {
  ref: "Article",
  localField: "_id",
  foreignField: "author",
});

UserSchema.pre("save", async function (next) {
  const hashedPassword = await bcrypt.hash(this.password, 10);
  this.password = hashedPassword;

  next();
});

UserSchema.methods.isValidPassword = async function (password) {
  const user = this;
  const validPassword = await bcrypt.compare(password, user.password);

  return validPassword;
};

const User = mongoose.model("User", UserSchema, "User");

module.exports = User;
