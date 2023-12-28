const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const answerSchema = new Schema({
  text: {
    type: String,
    required: [true, "The answer text field cannot be left empty."],
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  ans_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ans_date_time: {
    type: Date,
    default: Date.now,
  },
  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  downvotes: [
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

answerSchema.virtual("url").get(function () {
  return "/posts/answer/" + this._id;
});

module.exports = mongoose.model("Answer", answerSchema);
