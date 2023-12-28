import { useState } from "react";
import { useError } from "../context/ErrorContext";

import userService from "../services/userService";
import questionService from "../services/questionService";

import "../stylesheets/Header.css";

const Header = ({ user, onUserChange, onContentChange }) => {
  const { setError } = useError();
  const [searchValue, setSearchValue] = useState("");

  const handleSearchInputChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    try {
      if (searchValue.trim() === "") {
        onContentChange({ text: "questions", title: "Search Results", content: [] });
        return;
      }
      const searchArr = searchValue.toLowerCase().split(" ");
      const nonTags = [];
      const tags = [];
      for (const item of searchArr) {
        if (item.startsWith("[") && item.endsWith("]")) {
          const tagsArr = item.split("][");
          tagsArr[0] = tagsArr[0].substring(1);
          const lastIndex = tagsArr.length - 1;
          tagsArr[lastIndex] = tagsArr[lastIndex].slice(0, -1);
          for (const tag of tagsArr) {
            tags.push(tag.replace(/\[|\]/g, "").toLowerCase());
          }
        } else {
          nonTags.push(item.toLowerCase());
        }
      }
      const allQuestions = await questionService.getAllQuestions();
      const searchQuestions = allQuestions.filter((question) => {
        const questionInfo = `${question.title} ${question.text}`.toLowerCase();
        const hasMatchNonTags = nonTags.some((nonTag) => questionInfo.includes(nonTag));
        const hasMatchTags = tags.some((tag) => {
          return question.tags.some((questionTag) => questionTag.name.toLowerCase() === tag);
        });
        return hasMatchTags || hasMatchNonTags;
      });
      setSearchValue("");
      onContentChange({ text: "questions", title: "Search Results", content: searchQuestions });
    } catch (err) {
      setError(err);
    }
  };

  const handleLogout = async () => {
    try {
      await userService.logout();
      onContentChange({ text: "welcome" });
      onUserChange(null);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div id="header" className="header">
      <h1 className="header-title">Text Overflow</h1>
      <div className="header-right">
        <form onSubmit={handleSearchSubmit}>
          <input
            className="search-input"
            id="search-input"
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={handleSearchInputChange}
            autoComplete="off"
          />
        </form>
        {user && <button onClick={handleLogout}>Logout</button>}
      </div>
    </div>
  );
};

export default Header;
