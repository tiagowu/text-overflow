import React, { useEffect, useState } from "react";
import { useError } from "../context/ErrorContext";

import questionService from "../services/questionService";
import tagService from "../services/tagService";

import AnswersPage from "./AnswersPage";
import PostAnswerPage from "./PostAnswerPage";
import PostQuestionPage from "./PostQuestionPage";
import QuestionsPage from "./QuestionsPage";
import TagsPage from "./TagsPage";
import UserProfile from "./UserProfile";

import "../stylesheets/MainContent.css";

const MainContent = ({ user, currentContent, onContentChange }) => {
  const { setError } = useError();
  const [contentToRender, setContentToRender] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        switch (currentContent.text) {
          case "all-questions":
            const questions = await questionService.getAllQuestions();
            setContentToRender(<QuestionsPage user={user} onContentChange={onContentChange} title="All Questions" questions={questions} />);
            break;
          case "questions":
            setContentToRender(
              <QuestionsPage user={user} onContentChange={onContentChange} title={currentContent.title} questions={currentContent.content} />
            );
            break;
          case "user-answered-questions":
            setContentToRender(
              <QuestionsPage
                user={user}
                onContentChange={onContentChange}
                title={currentContent.title}
                questions={currentContent.content}
                profile={currentContent.profile}
              />
            );
            break;
          case "post-question":
            setContentToRender(<PostQuestionPage onContentChange={onContentChange} />);
            break;
          case "edit-question":
            setContentToRender(<PostQuestionPage onContentChange={onContentChange} question={currentContent.init} />);
            break;
          case "all-answers":
            setContentToRender(<AnswersPage user={user} onContentChange={onContentChange} question={currentContent.content} />);
            break;
          case "user-answers":
            setContentToRender(
              <AnswersPage user={user} onContentChange={onContentChange} question={currentContent.content} profile={currentContent.profile} />
            );
            break;
          case "post-answer":
            setContentToRender(<PostAnswerPage onContentChange={onContentChange} question={currentContent.content} />);
            break;
          case "edit-answer":
            setContentToRender(
              <PostAnswerPage
                onContentChange={onContentChange}
                question={currentContent.content}
                answer={currentContent.init}
                profile={currentContent.profile}
              />
            );
            break;
          case "all-tags":
            const tags = await tagService.getAllTags();
            setContentToRender(<TagsPage user={user} onContentChange={onContentChange} title="All Tags" tags={tags} />);
            break;
          case "user-tags":
            setContentToRender(
              <TagsPage
                user={user}
                onContentChange={onContentChange}
                title={currentContent.title}
                tags={currentContent.content}
                profile={currentContent.profile}
              />
            );
            break;
          case "user-profile":
            setContentToRender(<UserProfile user={user} onContentChange={onContentChange} />);
            break;
          default:
            setContentToRender(<QuestionsPage user={user} onContentChange={onContentChange} title="No Questions" questions={[]} />);
            break;
        }
      } catch (err) {
        if (currentContent.text === "all-questions") onContentChange({ text: "error" });
        setError(err);
      }
    };

    fetchContent();
  }, [currentContent, user, onContentChange, setError]);

  return <div id="main-content">{contentToRender}</div>;
};

export default MainContent;
