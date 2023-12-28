import React, { useState, useEffect } from "react";
import { useError } from "./context/ErrorContext";

import userService from "./services/userService";

import Header from "./components/Header";
import Main from "./components/Main";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import WelcomePage from "./components/WelcomePage";

import "./stylesheets/App.css";

function App() {
  const { setError } = useError();
  const [currentContent, setCurrentContent] = useState(null);
  const [user, setUser] = useState(null);

  const handleContentChange = (content) => {
    setCurrentContent(content);
  };

  const handleUserChange = (user) => {
    setUser(user);
  };

  useEffect(() => {
    const isLoggedIn = async () => {
      try {
        const data = await userService.auth();
        if (data.isLoggedIn) {
          setUser(data.user);
          setCurrentContent({ text: "all-questions" });
        } else {
          setCurrentContent({ text: "welcome" });
        }
      } catch (err) {
        setError(err);
        setCurrentContent({ text: "welcome" });
      }
    };

    isLoggedIn();
  }, [setError]);

  if (currentContent === null) {
    return null;
  }

  if (currentContent.text === "welcome") {
    return <WelcomePage onContentChange={handleContentChange} />;
  } else if (currentContent.text === "sign-up") {
    return <SignUpPage onContentChange={handleContentChange} />;
  } else if (currentContent.text === "login") {
    return <LoginPage onUserChange={handleUserChange} onContentChange={handleContentChange} />;
  }

  return (
    <React.Fragment>
      <Header user={user} onUserChange={handleUserChange} onContentChange={handleContentChange} />
      <Main user={user} currentContent={currentContent} onContentChange={handleContentChange} />
    </React.Fragment>
  );
}

export default App;
