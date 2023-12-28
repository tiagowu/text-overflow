import AnswerCard from "./AnswerCard";
import CommentCard from "./CommentCard";
import QuestionCard from "./QuestionCard";

import "../stylesheets/PaginatedList.css";

const PaginatedList = ({ type, items, itemsPerPage = 5, currentPage, setCurrentPage, onContentChange, user, parentItem, profile }) => {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => (prevPage % totalPages) + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => (prevPage === 1 ? totalPages : prevPage - 1));
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  return (
    <>
      {currentItems.map((item) =>
        type === "question" ? (
          <QuestionCard key={item._id} user={user} onContentChange={onContentChange} question={item} profile={profile} />
        ) : type === "answer" ? (
          <AnswerCard key={item._id} user={user} onContentChange={onContentChange} answer={item} question={parentItem} profile={profile} />
        ) : type === "comment" ? (
          <CommentCard key={item._id} user={user} comment={item} />
        ) : null
      )}

      {totalPages > 0 && (
        <div className="pagination">
          <button onClick={handlePrevPage} disabled={totalItems <= itemsPerPage || currentPage === 1}>
            &#11164;
          </button>
          <span>{`Page ${currentPage} of ${totalPages}`}</span>
          <button onClick={handleNextPage} disabled={totalItems <= itemsPerPage}>
            &#11166;
          </button>
        </div>
      )}
    </>
  );
};

export default PaginatedList;
