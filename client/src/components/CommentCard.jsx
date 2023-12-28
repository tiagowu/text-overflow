import { useState } from "react";
import { useError } from "../context/ErrorContext";

import commentService from "../services/commentService";
import formatDate from "../utils/formatDate";

import "../stylesheets/CommentCard.css";

const CommentCard = ({ user, comment }) => {
  const { setError } = useError();
  const [displayedComment, setDisplayedComment] = useState(comment);

  const handleUpvote = async () => {
    try {
      const updatedComment = await commentService.upvoteComment(displayedComment._id);
      setDisplayedComment(updatedComment);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="comment-container">
      <div className="comment-left">
        <div className="comment-vote">
          <button className={displayedComment.upvotes.includes(user?._id) ? "comment-voted" : ""} onClick={handleUpvote} disabled={!user}>
            &#11165;
          </button>
          <p className="comment-vote-num">{displayedComment.votes}</p>
        </div>

        <p>{comment.text}</p>
      </div>
      <div className="comment-metadata">
        <p className="comment-comm-by">{comment.comm_by.username}</p>
        <p className="comment-comm-date"> commented {formatDate(comment.comm_date_time)}</p>
      </div>
    </div>
  );
};

export default CommentCard;
