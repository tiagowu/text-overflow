const Answer = require("../models/answers");
const Comment = require("../models/comments");
const Question = require("../models/questions");
const Tag = require("../models/tags");

const userMiddleware = require("../middlewares/users");

let router = require("express").Router();

// Route to get all questions
router.get("/", async (req, res) => {
  try {
    let questions = await Question.find({})
      .populate({
        path: "asked_by",
        select: "-password -email",
      })
      .populate("tags");

    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error." });
  }
});

// Route to get all questions with a specific tag
router.get("/tag/:tid", async (req, res) => {
  try {
    const tagId = req.params.tid;

    const tag = await Tag.findOne({ _id: tagId });
    if (!tag) {
      return res.status(404).json({ error: "Tag not found." });
    }

    const questions = await Question.find({ tags: tagId })
      .populate({
        path: "asked_by",
        select: "-password -email",
      })
      .populate("tags");
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error." });
  }
});

// Route to create a question
router.post("/", userMiddleware.verifySession, async (req, res) => {
  try {
    const { title, summary, text, tags } = req.body;
    const user = req.user;

    const tagIds = [];
    for (const tagName of tags) {
      let existingTag = await Tag.findOne({ name: tagName });

      if (existingTag) {
        tagIds.push(existingTag._id);
        existingTag.questions += 1;
        await existingTag.save();
      } else {
        if (user.reputation < 50) {
          return res.status(400).json({ error: "You need at least 50 reputation to create a new tag." });
        }

        const newTag = new Tag({ name: tagName, created_by: user._id });
        const savedTag = await newTag.save();
        tagIds.push(savedTag._id);
      }
    }

    const newQuestion = new Question({
      title,
      summary,
      text,
      tags: tagIds,
      asked_by: user._id,
    });

    const savedQuestion = await newQuestion.save();
    user.questions_asked.push(savedQuestion);
    await user.save();

    res.status(201).json(savedQuestion);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error." });
  }
});

// Route to get a specific question using its ID
router.get("/:qid", async (req, res) => {
  try {
    const questionId = req.params.qid;

    const question = await Question.findOne({ _id: questionId })
      .populate({
        path: "asked_by",
        select: "-password -email",
      })
      .populate({
        path: "comments",
        populate: {
          path: "comm_by",
          model: "User",
          select: "-password -email",
        },
      })
      .populate({
        path: "answers",
        populate: [
          {
            path: "ans_by",
            model: "User",
            select: "-password -email",
          },
          {
            path: "comments",
            model: "Comment",
            populate: {
              path: "comm_by",
              model: "User",
              select: "-password -email",
            },
          },
        ],
      });

    if (!question) {
      return res.status(404).json({ error: "Question not found." });
    }

    res.status(200).json(question);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error." });
  }
});

// Route to update a specific question using its ID
router.put("/:qid", userMiddleware.verifySession, async (req, res) => {
  try {
    const questionId = req.params.qid;
    const user = req.user;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found." });
    }

    if (req.body.title) {
      question.title = req.body.title;
    }

    if (req.body.summary) {
      question.summary = req.body.summary;
    }

    if (req.body.text) {
      question.text = req.body.text;
    }

    if (req.body.tags) {
      for (const oldTagId of question.tags) {
        let oldTag = await Tag.findById(oldTagId);

        if (oldTag) {
          oldTag.questions -= 1;
          await oldTag.save();
          if (oldTag.questions === 0) {
            await Tag.deleteOne({ _id: oldTagId });
          }
        }
      }

      const tagIds = [];
      for (const tagName of req.body.tags) {
        let existingTag = await Tag.findOne({ name: tagName });

        if (existingTag) {
          tagIds.push(existingTag._id);
          existingTag.questions += 1;
          await existingTag.save();
        } else {
          if (user.reputation < 50) {
            return res.status(400).json({ error: "You need at least 50 reputation to create a new tag." });
          }

          const newTag = new Tag({ name: tagName, created_by: user._id });
          const savedTag = await newTag.save();
          tagIds.push(savedTag._id);
        }
      }
      question.tags = tagIds;
    }

    if (req.body.views) {
      question.views = req.body.views;
    }

    const updatedQuestion = await question.save();

    res.status(200).json(updatedQuestion);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error." });
  }
});

// Route to delete a question
router.delete("/:qid", userMiddleware.verifySession, async (req, res) => {
  try {
    const questionId = req.params.qid;
    const user = req.user;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found." });
    }

    if (!user.isAdmin && user._id.toString() !== question.asked_by.toString()) {
      return res.status(403).json({ error: "You are not authrorized to delete the question." });
    }

    for (const oldTagId of question.tags) {
      let oldTag = await Tag.findById(oldTagId);

      if (oldTag) {
        oldTag.questions -= 1;
        await oldTag.save();
        if (oldTag.questions === 0) {
          await Tag.deleteOne({ _id: oldTagId });
        }
      }
    }

    for (const answerId of question.answers) {
      const answer = await Answer.findById(answerId);
      if (answer) {
        for (const commentId of answer.comments) {
          await Comment.findByIdAndDelete(commentId);
        }

        await Answer.findByIdAndDelete(answerId);
      }
    }

    for (const commentId of question.comments) {
      await Comment.findByIdAndDelete(commentId);
    }

    await Question.findByIdAndDelete(questionId);

    user.questions_asked = user.questions_asked.filter((question) => question.toString() !== questionId);
    await user.save();

    res.status(200).json({ message: "Question and related data deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error." });
  }
});

// Route to create an answer for a question
router.post("/:qid/answers", userMiddleware.verifySession, async (req, res) => {
  const questionId = req.params.qid;
  const { text } = req.body;
  const user = req.user;

  try {
    const newAnswer = new Answer({
      text,
      ans_by: user,
    });

    const savedAnswer = await newAnswer.save();

    const question = await Question.findByIdAndUpdate(questionId, { $push: { answers: savedAnswer._id } }, { new: true });

    if (!question) {
      return res.status(404).json({ error: "Question not found." });
    }
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error." });
  }
});

// Route to update an answer of a question
router.put("/:qid/answers/:aid", userMiddleware.verifySession, async (req, res) => {
  try {
    const questionId = req.params.qid;
    const answerId = req.params.aid;
    const user = req.user;

    const question = await Question.findById(questionId).populate("answers");
    if (!question) {
      return res.status(404).json({ error: "Question not found." });
    }

    const answer = question.answers.find((answer) => answer._id.toString() === answerId);
    if (!answer) {
      return res.status(404).json({ error: "Answer not found." });
    }

    if (!user.isAdmin && user._id.toString() !== answer.ans_by.toString()) {
      return res.status(403).json({ error: "You are not authorized to edit the answer." });
    }

    if (req.body.text) {
      answer.text = req.body.text;
    }

    await answer.save();
    const updatedQuestion = await question.save();
    res.status(200).json(updatedQuestion);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error." });
  }
});

// Route to delete an answer of a question
router.delete("/:qid/answers/:aid", userMiddleware.verifySession, async (req, res) => {
  try {
    const questionId = req.params.qid;
    const answerId = req.params.aid;
    const user = req.user;

    const question = await Question.findById(questionId).populate("answers");
    if (!question) {
      return res.status(404).json({ error: "Question not found." });
    }

    const answer = question.answers.find((ans) => ans._id.toString() === answerId);
    if (!answer) {
      return res.status(404).json({ error: "Answer not found." });
    }

    if (!user.isAdmin && user._id.toString() !== question.asked_by.toString()) {
      return res.status(403).json({ error: "You are not authorized to delete the answer." });
    }

    for (const commentId of answer.comments) {
      await Comment.findByIdAndDelete(commentId);
    }

    await Answer.findByIdAndDelete(answerId);
    await question.save();

    res.status(200).json({ message: "Answer and related data deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error." });
  }
});

// Route to create a comment for a question
router.post("/:qid/comments", userMiddleware.verifySession, async (req, res) => {
  const questionId = req.params.qid;
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

    const question = await Question.findByIdAndUpdate(questionId, { $push: { comments: savedComment._id } }, { new: true }).populate({
      path: "comments",
      populate: {
        path: "comm_by",
        model: "User",
        select: "-password -email",
      },
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found." });
    }
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error." });
  }
});

// Route to upvote a question
router.post("/:qid/upvote", userMiddleware.verifySession, async (req, res) => {
  const questionId = req.params.qid;
  const userId = req.user._id;

  try {
    const question = await Question.findById(questionId)
      .populate({
        path: "asked_by",
        select: "-password -email",
      })
      .populate({
        path: "comments",
        populate: {
          path: "comm_by",
          model: "User",
          select: "-password -email",
        },
      })
      .populate("tags");

    if (!question) {
      return res.status(404).json({ error: "Question not found." });
    }

    const userWhoAsked = question.asked_by;
    if (!req.user.isAdmin) {
      if (userWhoAsked._id.toString() === userId.toString()) {
        return res.status(400).json({ error: "You cannot upvote your own question." });
      }

      if (req.user.reputation < 50) {
        return res.status(400).json({ error: "You need at least 50 reputation to upvote a question." });
      }
    }

    if (question.upvotes.includes(userId)) {
      question.upvotes = question.upvotes.filter((uid) => uid.toString() !== userId.toString());
      userWhoAsked.reputation -= 5; // upvote, already upvoted -> upvote is cancelled, reputation decreases by 5
    } else {
      question.upvotes.push(userId);

      if (question.downvotes.includes(userId)) {
        question.downvotes = question.downvotes.filter((uid) => uid.toString() !== userId.toString());
        userWhoAsked.reputation += 15; // upvote, but already downvoted -> downvote is cancelled (reputation increases by 10), then upvote (reputation increases by 5)
      } else {
        userWhoAsked.reputation += 5; // upvote, but has not upvoted/downvoted -> upvote (reputation increases by 5)
      }
    }

    question.votes = question.upvotes.length - question.downvotes.length;
    await Promise.all([question.save(), userWhoAsked.save()]);

    res.status(200).json(question);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error." });
  }
});

// Route to downvote a question
router.post("/:qid/downvote", userMiddleware.verifySession, async (req, res) => {
  const questionId = req.params.qid;
  const userId = req.user._id;

  try {
    const question = await Question.findById(questionId)
      .populate({
        path: "asked_by",
        select: "-password -email",
      })
      .populate({
        path: "comments",
        populate: {
          path: "comm_by",
          model: "User",
          select: "-password -email",
        },
      })
      .populate("tags");

    if (!question) {
      return res.status(404).json({ error: "Question not found." });
    }

    const userWhoAsked = question.asked_by;
    if (!req.user.isAdmin) {
      if (userWhoAsked._id.toString() === userId.toString()) {
        return res.status(400).json({ error: "You cannot downvote your own question." });
      }

      if (req.user.reputation < 50) {
        return res.status(400).json({ error: "You need at least 50 reputation to downvote a question." });
      }
    }

    if (question.downvotes.includes(userId)) {
      question.downvotes = question.downvotes.filter((uid) => uid.toString() !== userId.toString());
      userWhoAsked.reputation += 10; // downvote, already downvoted -> downvote is cancelled, reputation increases by 10
    } else {
      question.downvotes.push(userId);

      if (question.upvotes.includes(userId)) {
        question.upvotes = question.upvotes.filter((uid) => uid.toString() !== userId.toString());
        userWhoAsked.reputation -= 15; // downvote, but already upvoted -> upvote is cancelled (reputation decreases by 5), then downvote (reputation decreases by 10)
      } else {
        userWhoAsked.reputation -= 10; // downvote, but has not upvoted/downvoted -> downvote (reputation decreases by 10)
      }
    }

    question.votes = question.upvotes.length - question.downvotes.length;
    await Promise.all([question.save(), userWhoAsked.save()]);

    res.status(200).json(question);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error." });
  }
});

module.exports = router;
