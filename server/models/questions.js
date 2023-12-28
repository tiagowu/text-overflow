const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  title: {
    type: String,
    maxLength: [50, "The question title field cannot be more than 50 characters."],
    required: [true, "The question title field cannot be left empty."],
  },
  summary: {
    type: String,
    maxLength: [140, "The question summary field cannot be more than 140 characters."],
    required: [true, "The question text field cannot be left empty."],
  },
  text: {
    type: String,
    required: [true, "The question text field cannot be left empty."],
  },
  tags: [
    {
      type: Schema.Types.ObjectId,
      ref: "Tag",
    },
  ],
  answers: [
    {
      type: Schema.Types.ObjectId,
      ref: "Answer",
    },
  ],
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  asked_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ask_date_time: {
    type: Date,
    default: Date.now,
  },
  views: {
    type: Number,
    default: 0,
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

questionSchema.virtual("url").get(function () {
  return "/posts/question/" + this._id;
});

module.exports = mongoose.model("Question", questionSchema);
