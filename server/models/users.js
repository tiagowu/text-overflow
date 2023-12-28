const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
  },
  reputation: {
    type: Number,
    default: 0,
  },
  questions_asked: [
    {
      type: Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  member_since: {
    type: Date,
    default: Date.now,
  },
});

userSchema.virtual("url").get(function () {
  return "/posts/user/" + this._id;
});

module.exports = mongoose.model("User", userSchema);
