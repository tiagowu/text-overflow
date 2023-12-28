import { useState, useEffect } from "react";
import { useError } from "../context/ErrorContext";

import CustomInput from "./CustomInput";
import PaginatedList from "./PaginatedList";

import "../stylesheets/Comments.css";

const Comments = ({ user, id, comments, createComment, onContentChange }) => {
  const { setError } = useError();
  const [text, setText] = useState("");
  const [textError, setTextError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedComments, setDisplayedComments] = useState([]);

  const sortByNewest = (comments) => {
    const newestComments = comments.slice().sort((a, b) => {
      const commDateA = new Date(a.comm_date_time);
      const commDateB = new Date(b.comm_date_time);

      return commDateB - commDateA;
    });
    return newestComments;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTextError("");
    if (!text) {
      setTextError("The comment cannot be empty.");
    } else if (text.length > 140) {
      setTextError("The comment cannot be more than 140 characters.");
    } else {
      try {
        const newCommentData = {
          text,
        };
        const question = await createComment(newCommentData);
        const sortedComments = sortByNewest(question.comments);
        setDisplayedComments(sortedComments);
        setText("");
      } catch (err) {
        setError(err);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
  };

  useEffect(() => {
    const sortedComments = sortByNewest(comments);
    setDisplayedComments(sortedComments);
  }, [comments]);

  return (
    <div className="comments-container">
      {displayedComments.length > 0 && <p className="comments-title">All Comments ({displayedComments.length})</p>}
      <PaginatedList
        type="comment"
        items={displayedComments}
        currentPage={currentPage}
        itemsPerPage={3}
        setCurrentPage={setCurrentPage}
        onContentChange={onContentChange}
        user={user}
      />
      <form onSubmit={handleSubmit}>
        {user && (
          <CustomInput
            id={`comment-input-${id}`}
            name="comment"
            tag="textarea"
            placeholder={displayedComments.length === 0 ? "Be the first to comment..." : "Add your comment..."}
            value={text}
            onKeyDown={handleKeyDown}
            onChange={handleInputChange}
            error={textError}
            rows={4}
          />
        )}
      </form>
    </div>
  );
};

export default Comments;
