const Answer = require("../models/answers");
const Comment = require("../models/comments");

const userMiddleware = require("../middlewares/users");

let router = require("express").Router();

// Route to create an comment for an answer
router.post("/:aid/comments", userMiddleware.verifySession, async (req, res) => {
  const answerId = req.params.aid;
  const { text } = req.body;
  const user = req.user;

  try {
    if (!req.user.isAdmin) {
      if (user.reputation < 50) {
        return res.status(400).json({ error: "You need at least 50 reputation to add a comment." });
      }
    }

    const newComment = new Comment({
      text,
      comm_by: user,
    });

    const savedComment = await newComment.save();

    const answer = await Answer.findByIdAndUpdate(answerId, { $push: { comments: savedComment._id } }, { new: true }).populate({
      path: "comments",
      populate: {
        path: "comm_by",
        model: "User",
        select: "-password -email",
      },
    });

    if (!answer) {
      return res.status(404).json({ error: "Answer not found." });
    }
    res.status(201).json(answer);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to upvote an answer
router.post("/:aid/upvote", userMiddleware.verifySession, async (req, res) => {
  const answerId = req.params.aid;
  const userId = req.user._id;

  try {
    const answer = await Answer.findById(answerId)
      .populate({
        path: "ans_by",
        select: "-password -email",
      })
      .populate({
        path: "comments",
        populate: {
          path: "comm_by",
          model: "User",
          select: "-password -email",
        },
      });

    if (!answer) {
      return res.status(404).json({ error: "Answer not found." });
    }

    const userWhoAnswered = answer.ans_by;
    if (!req.user.isAdmin) {
      if (userWhoAnswered._id.toString() === userId.toString()) {
        return res.status(400).json({ error: "You cannot upvote your own answer." });
      }

      if (req.user.reputation < 50) {
        return res.status(400).json({ error: "You need at least 50 reputation to upvote an answer." });
      }
    }

    if (answer.upvotes.includes(userId)) {
      answer.upvotes = answer.upvotes.filter((uid) => uid.toString() !== userId.toString());
      userWhoAnswered.reputation -= 5; // upvote, already upvoted -> upvote is cancelled, reputation decreases by 5
    } else {
      answer.upvotes.push(userId);

      if (answer.downvotes.includes(userId)) {
        answer.downvotes = answer.downvotes.filter((uid) => uid.toString() !== userId.toString());
        userWhoAnswered.reputation += 15; // upvote, but already downvoted -> downvote is cancelled (reputation increases by 10), then upvote (reputation increases by 5)
      } else {
        userWhoAnswered.reputation += 5; // upvote, but has not upvoted/downvoted -> upvote (reputation increases by 5)
      }
    }

    answer.votes = answer.upvotes.length - answer.downvotes.length;
    await Promise.all([answer.save(), userWhoAnswered.save()]);

    res.status(200).json(answer);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to downvote an answer
router.post("/:aid/downvote", userMiddleware.verifySession, async (req, res) => {
  const answerId = req.params.aid;
  const userId = req.user._id;

  try {
    const answer = await Answer.findById(answerId)
      .populate({
        path: "ans_by",
        select: "-password -email",
      })
      .populate({
        path: "comments",
        populate: {
          path: "comm_by",
          model: "User",
          select: "-password -email",
        },
      });

    if (!answer) {
      return res.status(404).json({ error: "Answer not found." });
    }

    const userWhoAnswered = answer.ans_by;
    if (!req.user.isAdmin) {
      if (userWhoAnswered._id.toString() === userId.toString()) {
        return res.status(400).json({ error: "You cannot downvote your own answer." });
      }

      if (req.user.reputation < 50) {
        return res.status(400).json({ error: "You need at least 50 reputation to downvote an answer." });
      }
    }

    if (answer.downvotes.includes(userId)) {
      answer.downvotes = answer.downvotes.filter((uid) => uid.toString() !== userId.toString());
      userWhoAnswered.reputation += 10; // downvote, already downvoted -> downvote is cancelled, reputation increases by 10
    } else {
      answer.downvotes.push(userId);

      if (answer.upvotes.includes(userId)) {
        answer.upvotes = answer.upvotes.filter((uid) => uid.toString() !== userId.toString());
        userWhoAnswered.reputation -= 15; // downvote, but already upvoted -> upvote is cancelled (reputation decreases by 5), then downvote (reputation decreases by 10)
      } else {
        userWhoAnswered.reputation -= 10; // downvote, but has not upvoted/downvoted -> downvote (reputation decreases by 10)
      }
    }

    answer.votes = answer.upvotes.length - answer.downvotes.length;
    await Promise.all([answer.save(), userWhoAnswered.save()]);

    res.status(200).json(answer);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
