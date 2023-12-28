import "../stylesheets/AskQuestionButton.css";

const AskQuestionButton = ({ onContentChange }) => {
  return (
    <button
      className="ask-question-button"
      onClick={() => {
        onContentChange({ text: "post-question" });
      }}
    >
      Ask Question
    </button>
  );
};

export default AskQuestionButton;
