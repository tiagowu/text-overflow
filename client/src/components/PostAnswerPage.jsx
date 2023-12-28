import { useState } from "react";
import { useError } from "../context/ErrorContext";

import questionService from "../services/questionService";

import validateLinks from "../utils/validateLinks";

import CustomInput from "./CustomInput";

import "../stylesheets/PostAnswerPage.css";

const PostAnswerPage = ({ onContentChange, question, answer, profile }) => {
  const { setError } = useError();
  const [formData, setFormData] = useState(
    answer || {
      text: "",
    }
  );

  const [formErrors, setFormErrors] = useState({
    textError: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { text } = formData;
    const newFormErrors = {
      textError: "",
    };

    if (!text) {
      newFormErrors.textError = "The answer text field cannot be left empty.";
    } else if (!validateLinks(text)) {
      newFormErrors.textError = "The content inside '()' must not be empty and must start with 'https://' or 'http://'";
    }

    setFormErrors(newFormErrors);

    if (!newFormErrors.textError) {
      if (answer) {
        try {
          await questionService.updateAnswer(question._id, formData._id, formData);
          const updatedQuestion = await questionService.getQuestion(question._id);
          onContentChange({ text: "user-answers", content: updatedQuestion, profile: profile });
        } catch (err) {
          setError(err);
        }
      } else {
        try {
          const newAnswerData = { text };
          await questionService.createAnswer(question._id, newAnswerData);
          const updatedQuestion = await questionService.getQuestion(question._id);
          onContentChange({ text: "all-answers", content: updatedQuestion });
        } catch (err) {
          setError(err);
        }
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const deleteAnswer = async (e) => {
    e.preventDefault();
    try {
      await questionService.deleteAnswer(question._id, formData._id);
      const updatedQuestion = await questionService.getQuestion(question._id);
      onContentChange({ text: "user-answers", content: updatedQuestion });
    } catch (err) {
      setError(err);
    }
  };

  return (
    <form className="post-answer-form" onSubmit={handleSubmit}>
      <CustomInput
        id="answer-text"
        name="text"
        label="Answer Text"
        hint=""
        tag="textarea"
        placeholder="Enter your answer..."
        value={formData.text}
        onChange={handleInputChange}
        error={formErrors.textError}
        rows={8}
      />
      <div className="post-answer-bottom">
        <input className="post-answer-button" type="submit" value="Post Answer" />
        {answer && <button onClick={deleteAnswer}>Delete Answer</button>}
        <p>* indicated mandatory fields</p>
      </div>
    </form>
  );
};

export default PostAnswerPage;
