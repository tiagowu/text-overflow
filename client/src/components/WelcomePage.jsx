import "../stylesheets/WelcomePage.css";

const WelcomePage = ({ onContentChange }) => {
  return (
    <div className="welcome-page">
      <div className="welcome-container">
        <h2>Welcome to Text Overflow!</h2>
        <div className="welcome-action">
          <p>Don't have an account?</p>
          <button onClick={() => onContentChange({ text: "sign-up" })}>Sign Up</button>
        </div>
        <div className="welcome-action">
          <p>Already have an account?</p>
          <button onClick={() => onContentChange({ text: "login" })}>Login</button>
        </div>
        <div className="welcome-action">
          <p>Continue as guest?</p>
          <button onClick={() => onContentChange({ text: "all-questions" })}>Guest</button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
