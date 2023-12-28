const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tagSchema = new Schema({
  name: {
    type: String,
    required: [true, "Tags should not exceed 10 characters each."],
    // maxLength: [10, "Tag name cannot exceed 10 characters."],
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  questions: {
    type: Number,
    default: 1,
  },
});

tagSchema.virtual("url").get(function () {
  return "/posts/tag/" + this._id;
});

module.exports = mongoose.model("Tag", tagSchema);
