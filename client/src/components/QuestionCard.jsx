import { useState } from "react";
import { useError } from "../context/ErrorContext";

import questionService from "../services/questionService";
import formatDate from "../utils/formatDate";

import "../stylesheets/QuestionCard.css";

const QuestionCard = ({ user, onContentChange, question, profile }) => {
  const { setError } = useError();
  const [displayedQuestion, setDisplayedQuestion] = useState(question);
  const tags = question.tags;

  const handleUpvote = async () => {
    try {
      const updatedQuestion = await questionService.upvoteQuestion(displayedQuestion._id);
      setDisplayedQuestion(updatedQuestion);
    } catch (err) {
      setError(err);
    }
  };

  const handleDownvote = async () => {
    try {
      const updatedQuestion = await questionService.downvoteQuestion(displayedQuestion._id);
      setDisplayedQuestion(updatedQuestion);
    } catch (err) {
      setError(err);
    }
  };

  const handleQuestionClick = async (e) => {
    try {
      e.preventDefault();
      await questionService.updateQuestion(displayedQuestion._id, { views: displayedQuestion.views + 1 });
      const updatedQuestion = await questionService.getQuestion(displayedQuestion._id);
      if (profile) {
        onContentChange({ text: "user-answers", content: updatedQuestion, profile: profile });
      } else {
        onContentChange({ text: "all-answers", content: updatedQuestion });
      }
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="question-card">
      <div className="question-left">
        <div className="question-vote">
          <button className={displayedQuestion.upvotes.includes(user?._id) ? "question-voted" : ""} onClick={handleUpvote} disabled={!user}>
            &#11165;
          </button>
          <p className="question-votes-num">{displayedQuestion.votes}</p>
          <button className={displayedQuestion.downvotes.includes(user?._id) ? "question-voted" : ""} onClick={handleDownvote} disabled={!user}>
            &#11167;
          </button>
        </div>

        <div className="question-data">
          <p className="question-answers-num">{displayedQuestion.answers.length} answers</p>
          <p className="question-views-num">{displayedQuestion.views} views</p>
        </div>
      </div>
      <div className="question-info">
        <p className="question-title">
          <a href="/" onClick={handleQuestionClick}>
            {displayedQuestion.title}
          </a>
        </p>
        <p>{displayedQuestion.summary}</p>
        <div className="tags-container">
          {tags.map((tag) => (
            <span key={tag._id} className="question-tag">
              {tag.name}
            </span>
          ))}
        </div>
      </div>
      <div className="question-metadata">
        <span className="question-asked-by">{displayedQuestion.asked_by.username}</span>
        <span className="question-ask-date"> asked {formatDate(displayedQuestion.ask_date_time)}</span>
      </div>
    </div>
  );
};

export default QuestionCard;
