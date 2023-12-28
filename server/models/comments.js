const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  text: {
    type: String,
    maxLength: [140, "The comment text field cannot be more than 140 characters."],
  },
  comm_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comm_date_time: {
    type: Date,
    default: Date.now,
  },
  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  votes: {
    type: Number,
    default: 0,
  },
});

commentSchema.virtual("url").get(function () {
  return "/posts/comment/" + this._id;
});

module.exports = mongoose.model("Comment", commentSchema);
