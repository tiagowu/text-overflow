import { useState, useEffect } from "react";

import AskQuestionButton from "./AskQuestionButton";
import PaginatedList from "./PaginatedList";

import "../stylesheets/QuestionsPage.css";

const QuestionsPage = ({ user, onContentChange, title, questions, profile }) => {
  const [activeButton, setActiveButton] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedQuestions, setDisplayedQuestions] = useState([]);

  const sortByNewest = (questions) => {
    const newestQuestions = questions.slice().sort((a, b) => {
      const askDateA = new Date(a.ask_date_time);
      const askDateB = new Date(b.ask_date_time);

      return askDateB - askDateA;
    });
    return newestQuestions;
  };

  const sortByActive = (questions) => {
    const activeQuestions = questions.slice().sort((a, b) => {
      const getMostRecentAnswerTime = (question) => {
        return question.answers.reduce((mostRecent, answer) => {
          const answerDate = new Date(answer.ans_date_time);
          if (answerDate > mostRecent) {
            return answerDate;
          }
          return mostRecent;
        }, new Date(0));
      };

      const aMostRecentAnswerTime = getMostRecentAnswerTime(a);
      const bMostRecentAnswerTime = getMostRecentAnswerTime(b);

      if (!aMostRecentAnswerTime && !bMostRecentAnswerTime) {
        return b.ask_date_time - a.ask_date_time;
      }

      return bMostRecentAnswerTime - aMostRecentAnswerTime;
    });

    return activeQuestions;
  };

  const sortByUnanswered = (questions) => {
    const newestQuestions = sortByNewest(questions);
    const unansweredQuestions = newestQuestions.filter((question) => question.answers.length === 0);
    return unansweredQuestions;
  };

  const sortingButtons = [
    {
      title: "Newest",
      sorting: sortByNewest,
    },
    {
      title: "Active",
      sorting: sortByActive,
    },
    {
      title: "Unanswered",
      sorting: sortByUnanswered,
    },
  ];

  useEffect(() => {
    setCurrentPage(1);
    setActiveButton("newest");
    const sortedQuestions = sortByNewest(questions);
    setDisplayedQuestions(sortedQuestions);
  }, [questions, onContentChange]);

  return (
    <div className="questions-page">
      <div className="questions-top">
        <div className="questions-header">
          <h2>{title}</h2>
          {user && <AskQuestionButton onContentChange={onContentChange} />}
        </div>
        <div className="questions-subheader">
          <h3>{questions.length} Questions</h3>
          <div className="sorting-buttons">
            {sortingButtons.map((button) => (
              <button
                key={button.title.toLowerCase()}
                className={`sorting-button ${button.title.toLowerCase() === activeButton ? "active-button" : ""}`}
                onClick={() => {
                  setCurrentPage(1);
                  setActiveButton(button.title.toLowerCase());
                  const sortedQuestions = button.sorting(questions);
                  setDisplayedQuestions(sortedQuestions);
                }}
              >
                {button.title}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="questions-container">
        {displayedQuestions.length === 0 ? (
          <h2 className="no-questions-title">No Questions Found</h2>
        ) : (
          <PaginatedList
            type="question"
            items={displayedQuestions}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onContentChange={onContentChange}
            user={user}
            profile={profile}
          />
        )}
      </div>
    </div>
  );
};

export default QuestionsPage;
