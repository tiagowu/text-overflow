import "../stylesheets/AnswerQuestionButton.css";

const AnswerQuestionButton = ({ onContentChange, question }) => {
  return (
    <button
      className="answer-question-button"
      onClick={() => {
        onContentChange({ text: "post-answer", content: question });
      }}
    >
      Answer Question
    </button>
  );
};

export default AnswerQuestionButton;
