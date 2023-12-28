const bcrypt = require("bcrypt");
const User = require("../models/users");
const Answer = require("../models/answers");
const Question = require("../models/questions");
const Tag = require("../models/tags");
const Comment = require("../models/comments");

const userMiddleware = require("../middlewares/users");

let router = require("express").Router();

router.get("/auth", async (req, res) => {
  try {
    if (req.session && req.session.userId) {
      const user = await User.findById(req.session.userId).select("-password");

      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      const userData = {
        member_since: user.member_since,
        reputation: user.reputation,
        username: user.username,
        _id: user._id,
      };

      const adminEmails = ["admin@fakeso.com"];
      if (adminEmails.includes(user.email)) {
        userData.isAdmin = true;
      }

      res.json({ isLoggedIn: true, user: userData });
    } else {
      res.json({ isLoggedIn: false });
    }
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const isExistingUser = await User.findOne({ email });
    if (isExistingUser) {
      return res.status(409).json({ error: "Email is already in use. Please choose a different email." });
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password. Please try again." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password. Please try again." });
    }

    req.session.userId = user._id;
    req.session.save();

    const userData = {
      member_since: user.member_since,
      reputation: user.reputation,
      username: user.username,
      _id: user._id,
    };

    const adminEmails = ["admin@fakeso.com"];
    if (adminEmails.includes(user.email)) {
      userData.isAdmin = true;
    }

    return res.status(201).json({ message: "Logged in successfully", user: userData });
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) console.log(err);
    });

    return res.status(201).json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get user profile by user id
router.get("/users/:uid", userMiddleware.verifySession, async (req, res) => {
  try {
    const userId = req.params.uid;
    const loggedInUser = req.user;

    if (loggedInUser.isAdmin && loggedInUser._id.toString() === userId) {
      const allUsers = await User.find({}, "_id username email");
      const user = await User.findById(userId).populate({
        path: "questions_asked",
        populate: { path: "tags" },
      });

      return res.json({
        _id: user._id,
        username: user.username,
        member_since: user.member_since,
        reputation: user.reputation,
        questions_asked: user.questions_asked,
        users: allUsers,
      });
    } else {
      const user = await User.findById(userId).populate({
        path: "questions_asked",
        populate: { path: "tags" },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      res.json({
        _id: user._id,
        username: user.username,
        member_since: user.member_since,
        reputation: user.reputation,
        questions_asked: user.questions_asked,
      });
    }
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error." });
  }
});

// Route to delete user
router.delete("/users/:uid", userMiddleware.verifySession, async (req, res) => {
  try {
    const userId = req.params.uid;
    const loggedInUser = req.user;

    if (!loggedInUser.isAdmin) {
      return res.status(403).json({ error: "You do not have permission to delete the user." });
    }

    const userToDelete = await User.findById(userId);
    console.log(userToDelete);

    if (!userToDelete) {
      return res.status(404).json({ error: "User not found." });
    }

    const questionsToDelete = await Question.find({ asked_by: userId });

    for (const question of questionsToDelete) {
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

      await Question.findByIdAndDelete(question._id);
    }

    const answersToDelete = await Answer.find({ ans_by: userId });

    for (const answer of answersToDelete) {
      for (const commentId of answer.comments) {
        await Comment.findByIdAndDelete(commentId);
      }

      await Question.findOneAndUpdate({ answers: answer._id }, { $pull: { answers: answer._id } }, { new: true });
      await Answer.findByIdAndDelete(answer._id);
    }

    const commentsToDelete = await Comment.find({ comm_by: userId });

    for (const comment of commentsToDelete) {
      await Question.findOneAndUpdate({ comments: comment._id }, { $pull: { comments: comment._id } }, { new: true });
      await Comment.findByIdAndDelete(comment._id);
    }

    for (const comment of commentsToDelete) {
      await Answer.findOneAndUpdate({ comments: comment._id }, { $pull: { comments: comment._id } }, { new: true });
      await Comment.findByIdAndDelete(comment._id);
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User and related data deleted successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error." });
  }
});

// Route to get all tags created by a user
router.get("/users/:uid/tags", userMiddleware.verifySession, async (req, res) => {
  try {
    const userId = req.params.uid;
    const user = req.user;

    if (!user.isAdmin && user._id.toString() !== userId) {
      return res.status(403).json({ error: "You are not authrorized to get tags of a user." });
    }

    const userTags = await Tag.find({ created_by: userId });
    res.status(200).json(userTags);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error." });
  }
});

// Route to get all questions answered by a user
router.get("/users/:uid/answered", userMiddleware.verifySession, async (req, res) => {
  try {
    const userId = req.params.uid;

    const questions = await Question.find()
      .populate({
        path: "asked_by",
        select: "-password -email",
      })
      .populate("answers")
      .populate("tags");
    const answeredQuestions = questions.filter((question) => question.answers.some((answer) => answer.ans_by._id.toString() === userId));

    res.status(200).json(answeredQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
