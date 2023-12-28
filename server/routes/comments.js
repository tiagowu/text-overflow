const Comment = require("../models/comments");

const userMiddleware = require("../middlewares/users");

let router = require("express").Router();

// Route to upvote a comment
router.post("/:cid/upvote", userMiddleware.verifySession, async (req, res) => {
  const commentId = req.params.cid;
  const userId = req.user._id;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const userWhoCommented = comment.comm_by;
    if (!req.user.isAdmin) {
      if (userWhoCommented._id.toString() === userId.toString()) {
        return res.status(400).json({ error: "You cannot upvote your own comment" });
      }

      if (req.user.reputation < 50) {
        return res.status(400).json({ error: "You need at least 50 reputation to upvote a comment." });
      }
    }

    if (comment.upvotes.includes(userId)) {
      comment.upvotes = comment.upvotes.filter((uid) => uid.toString() !== userId.toString());
    } else {
      comment.upvotes.push(userId);
    }

    comment.votes = comment.upvotes.length;
    await comment.save();

    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json({ error: "Interal Server Error." });
  }
});

module.exports = router;
