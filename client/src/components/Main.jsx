import MainContent from "./MainContent";
import MainMenu from "./MainMenu";

import "../stylesheets/Main.css";

const Main = ({ user, currentContent, onContentChange }) => {
  return (
    <div id="main">
      <MainMenu user={user} currentContent={currentContent} onContentChange={onContentChange} />
      <MainContent user={user} currentContent={currentContent} onContentChange={onContentChange} />
    </div>
  );
};

export default Main;
