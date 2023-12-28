const Question = require("../models/questions");
const Tag = require("../models/tags");

const userMiddleware = require("../middlewares/users");

let router = require("express").Router();

// Route to get all tags w/ num of questions with each tag
router.get("/", async (req, res) => {
  try {
    let tags = await Tag.find({});

    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to update tag
router.put("/:tid", userMiddleware.verifySession, async (req, res) => {
  try {
    const tagId = req.params.tid;
    const userId = req.user._id;
    const tagName = req.body.name;

    const tag = await Tag.findById(tagId);
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    if (req.user.isAdmin || tag.created_by.toString() === userId.toString()) {
      const questionsWithTag = await Question.find({ tags: tagId });
      const otherUsersQuestions = questionsWithTag.filter((question) => question.asked_by.toString() !== tag.created_by.toString());

      if (otherUsersQuestions.length === 0) {
        const existingTag = await Tag.findOne({ name: tagName });
        if (existingTag) {
          return res.status(403).json({ error: "A tag already exists with that name." });
        }

        const updatedTag = await Tag.findByIdAndUpdate(tagId, { name: req.body.name }, { new: true });

        return res.json(updatedTag);
      } else {
        return res.status(403).json({ error: "You are not allowed edit the tag. It is currently being used by other users in their questions." });
      }
    } else {
      return res.status(403).json({ error: "You do not have permission to edit this tag." });
    }
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to delete tag
router.delete("/:tid", userMiddleware.verifySession, async (req, res) => {
  try {
    const tagId = req.params.tid;
    const userId = req.user._id;

    const tag = await Tag.findById(tagId);
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    if (req.user.isAdmin || tag.created_by.toString() === userId.toString()) {
      const questionsWithTag = await Question.find({ tags: tagId });
      const otherUsersQuestions = questionsWithTag.filter((question) => question.asked_by.toString() !== tag.created_by.toString());

      if (otherUsersQuestions.length === 0) {
        await Question.updateMany({ tags: tagId }, { $pull: { tags: tagId } });
        await Tag.findByIdAndDelete(tagId);

        return res.status(200).json({ message: "Tag deleted successfully" });
      } else {
        return res
          .status(403)
          .json({ error: "You are not allowed to delete the tag. It is currently being used by other users in their questions." });
      }
    } else {
      return res.status(403).json({ error: "You do not have permission to delete this tag." });
    }
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
