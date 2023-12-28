import { useState } from "react";
import { useError } from "../context/ErrorContext";

import answerService from "../services/answerService";

import formatDate from "../utils/formatDate";
import parseText from "../utils/parseText";

import Comments from "./Comments";

import "../stylesheets/AnswerCard.css";

const AnswerCard = ({ user, onContentChange, answer, question, profile }) => {
  const { setError } = useError();
  const [displayedAnswer, setDisplayedAnswer] = useState(answer);

  const handleUpvote = async () => {
    try {
      const updatedAnswer = await answerService.upvoteAnswer(displayedAnswer._id);
      setDisplayedAnswer(updatedAnswer);
    } catch (err) {
      setError(err);
    }
  };

  const handleDownvote = async () => {
    try {
      const updatedAnswer = await answerService.downvoteAnswer(displayedAnswer._id);
      setDisplayedAnswer(updatedAnswer);
    } catch (err) {
      setError(err);
    }
  };

  const createComment = async (newCommentData) => {
    return await answerService.createAnswerComment(answer._id, newCommentData);
  };

  const handleAnswerEdit = (e) => {
    e.preventDefault();

    const answerData = {
      _id: answer._id,
      text: answer.text,
    };
    onContentChange({ text: "edit-answer", content: question, init: answerData, profile: profile });
  };

  return (
    <div className="answer-card">
      <div className="answer-vote">
        <button className={displayedAnswer.upvotes.includes(user?._id) ? "answer-voted" : ""} onClick={handleUpvote} disabled={!user}>
          &#11165;
        </button>
        <p className="answer-votes-num">{displayedAnswer.votes}</p>
        <button className={displayedAnswer.downvotes.includes(user?._id) ? "answer-voted" : ""} onClick={handleDownvote} disabled={!user}>
          &#11167;
        </button>
      </div>

      <div className="answer-info">
        <div className="answer-text-container">
          <p>{parseText(answer.text)}</p>
          {profile && answer.ans_by._id === profile._id && (
            <button className="answer-edit-button" onClick={handleAnswerEdit}>
              Edit
            </button>
          )}
        </div>
        <Comments user={user} comments={answer.comments} createComment={createComment} id={answer._id} />
      </div>

      <div className="answer-metadata">
        <p className="answer-ans-by">{answer.ans_by.username}</p>
        <p className="answer-ans-date"> answered {formatDate(answer.ans_date_time)}</p>
      </div>
    </div>
  );
};

export default AnswerCard;
