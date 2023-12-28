import { useState } from "react";
import questionService from "../services/questionService";

import formatDate from "../utils/formatDate";
import parseText from "../utils/parseText";

import AskQuestionButton from "./AskQuestionButton";
import AnswerQuestionButton from "./AnswerQuestionButton";
import Comments from "./Comments";
import PaginatedList from "./PaginatedList";

import "../stylesheets/AnswersPage.css";

const AnswersPage = ({ user, onContentChange, question, profile }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const answers = question.answers;

  const sortByNewest = (answers) => {
    const newestAnswers = answers.slice().sort((a, b) => {
      const ansDateA = new Date(a.ans_date_time);
      const ansDateB = new Date(b.ans_date_time);
      return ansDateB - ansDateA;
    });
    return newestAnswers;
  };

  let displayedAnswers;
  if (profile) {
    const userAnswers = answers.filter((ans) => ans.ans_by._id === profile?._id);
    const otherAnswers = answers.filter((ans) => ans.ans_by._id !== profile?._id);

    displayedAnswers = [...sortByNewest(userAnswers), ...sortByNewest(otherAnswers)];
  } else {
    displayedAnswers = sortByNewest(answers);
  }

  const createComment = async (newCommentData) => {
    return await questionService.createQuestionComment(question._id, newCommentData);
  };

  return (
    <div className="answers-page">
      <div className="answers-header">
        <h2 className="answers-num-title">{question.answers.length} Answers</h2>
        <h2 className="answers-title">{question.title}</h2>
        <div className="ask-button-container">{user && <AskQuestionButton onContentChange={onContentChange} />}</div>
      </div>
      <div className="answers-question-info">
        <h3 className="question-views">{question.views} views</h3>
        <div className="answers-question-data">
          <p className="question-text">{parseText(question.text)}</p>
          <Comments user={user} comments={question.comments} onContentChange={onContentChange} createComment={createComment} id={question._id} />
        </div>

        <div className="answers-question-metadata">
          <p className="question-asked-by">{question.asked_by.username}</p>
          <p className="question-ask-date"> asked {formatDate(question.ask_date_time)}</p>
        </div>
      </div>
      <PaginatedList
        type="answer"
        items={displayedAnswers}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onContentChange={onContentChange}
        user={user}
        parentItem={question}
        profile={profile}
      />
      <div className="answers-page-bottom">{user && <AnswerQuestionButton onContentChange={onContentChange} question={question} />}</div>
    </div>
  );
};

export default AnswersPage;
