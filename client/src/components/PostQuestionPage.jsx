import { useState } from "react";
import { useError } from "../context/ErrorContext";

import questionService from "../services/questionService";
import validateLinks from "../utils/validateLinks";

import CustomInput from "./CustomInput";

import "../stylesheets/PostQuestionPage.css";

const PostQuestionPage = ({ onContentChange, question }) => {
  const { setError } = useError();
  const [formData, setFormData] = useState(
    question || {
      title: "",
      summary: "",
      text: "",
      tags: "",
    }
  );

  const [formErrors, setFormErrors] = useState({
    titleError: "",
    summaryError: "",
    textError: "",
    tagsError: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, summary, text, tags } = formData;
    const newFormErrors = {
      titleError: "",
      summaryError: "",
      textError: "",
      tagsError: "",
    };

    if (!title) {
      newFormErrors.titleError = "The question title field cannot be left empty.";
    } else if (title.length > 50) {
      newFormErrors.titleError = "The question title field cannot be more than 50 characters.";
    }

    if (!summary) {
      newFormErrors.summaryError = "The question summary field cannot be left empty.";
    } else if (summary.length > 140) {
      newFormErrors.summaryError = "The question summary field cannot be more than 50 characters.";
    }

    if (!text) {
      newFormErrors.textError = "The question text field cannot be left empty.";
    } else if (!validateLinks(text)) {
      newFormErrors.textError = 'The content inside \'()\' must not be empty and must start with "https://" or "http://"';
    }

    let tagsArray = tags
      .toLowerCase()
      .split(" ")
      .filter((tag) => tag.trim() !== "");
    const uniqueTagsSet = new Set(tagsArray);
    tagsArray = [...uniqueTagsSet];
    if (!tagsArray.length) {
      newFormErrors.tagsError = "The question tag field cannot be left empty.";
    } else if (tagsArray.length > 5) {
      newFormErrors.tagsError = "There cannot be more than 5 tags.";
    } else {
      for (const tag of tagsArray) {
        if (tag.length > 10) {
          newFormErrors.tagsError = "Tags should not exceed 10 characters each.";
          break;
        }
      }
    }

    setFormErrors(newFormErrors);

    if (!newFormErrors.titleError && !newFormErrors.summaryError && !newFormErrors.textError && !newFormErrors.tagsError) {
      const newQuestionData = {
        title,
        summary,
        text,
        tags: tagsArray,
      };

      if (question) {
        try {
          await questionService.updateQuestion(question._id, newQuestionData);
          onContentChange({ text: "user-profile" });
        } catch (err) {
          setError(err);
        }
      } else {
        try {
          await questionService.createQuestion(newQuestionData);
          onContentChange({ text: "all-questions" });
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

  const deleteQuestion = async (e) => {
    e.preventDefault();
    try {
      await questionService.deleteQuestion(question._id);
      onContentChange({ text: "user-profile" });
    } catch (err) {
      setError(err);
    }
  };

  return (
    <form className="post-question-form" onSubmit={handleSubmit}>
      <CustomInput
        id="question-title"
        name="title"
        label="Question Title"
        hint="Limit title to 50 characters or less"
        tag="input"
        placeholder="Enter a question title..."
        value={formData.title}
        onChange={handleInputChange}
        error={formErrors.titleError}
      />

      <CustomInput
        id="question-summary"
        name="summary"
        label="Question Summary"
        hint="Limit summary to 140 characters or less"
        tag="textarea"
        placeholder="Enter a question summary..."
        value={formData.summary}
        onChange={handleInputChange}
        error={formErrors.summaryError}
        rows={3}
      />

      <CustomInput
        id="question-text"
        name="text"
        label="Question Text"
        hint="Add details"
        tag="textarea"
        placeholder="Enter a question..."
        value={formData.text}
        onChange={handleInputChange}
        error={formErrors.textError}
        rows={5}
      />

      <CustomInput
        id="question-tags"
        name="tags"
        label="Tags"
        hint="Add keywords separated by whitespace"
        tag="input"
        placeholder="Enter tags associated with the question..."
        value={formData.tags}
        onChange={handleInputChange}
        error={formErrors.tagsError}
        rows={4}
      />

      <div className="post-question-bottom">
        <input className="post-question-button" type="submit" value="Post Question" />
        {question && <button onClick={deleteQuestion}>Delete Question</button>}
        <p>* indicated mandatory fields</p>
      </div>
    </form>
  );
};

export default PostQuestionPage;
