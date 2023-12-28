import { useState, useEffect } from "react";
import { useError } from "../context/ErrorContext";
import userService from "../services/userService";

import formatDate from "../utils/formatDate";

import Modal from "./Modal";

import "../stylesheets/UserProfile.css";

const UserProfile = ({ user, onContentChange }) => {
  const { setError } = useError();
  const [userProfile, setUserProfile] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await userService.getUserProfile(user._id);
        setUserProfile(userData);
      } catch (err) {
        setError(err);
      }
    };

    fetchUserProfile();
  }, [setError, user, onContentChange]);

  const handleUserClick = async (e, user) => {
    e.preventDefault();

    try {
      const userData = await userService.getUserProfile(user._id);
      setUserProfile(userData);
    } catch (err) {
      setError(err);
    }
  };

  const handleUserDelete = async (e, userToDelete) => {
    e.preventDefault();

    try {
      await userService.deleteUser(userToDelete._id);
      const userData = await userService.getUserProfile(user._id);
      setUserProfile(userData);
    } catch (err) {
      setError(err);
    }
    setDeleteModalOpen(null);
  };

  const handleQuestionClick = (e, question) => {
    e.preventDefault();

    const tagsString = question.tags.map((tag) => tag.name).join(" ");

    const questionData = {
      _id: question._id,
      title: question.title,
      summary: question.summary,
      text: question.text,
      tags: tagsString,
    };
    onContentChange({ text: "edit-question", init: questionData });
  };

  const handleTagsCreated = async (e, userId) => {
    e.preventDefault();

    try {
      const tags = await userService.getUserTags(userId);
      onContentChange({ text: "user-tags", title: "Tags Created", content: tags, profile: userProfile });
    } catch (err) {
      setError(err);
    }
  };

  const handleQuestionsAnswered = async (e, userId) => {
    e.preventDefault();

    try {
      const questions = await userService.getUserAnsweredQuestions(userId);
      onContentChange({ text: "user-answered-questions", title: "Answered Questions", content: questions, profile: userProfile });
    } catch (err) {
      setError(err);
    }
  };

  return (
    <>
      {userProfile && (
        <div className="user-profile">
          <div className="user-profile-info">
            <h2 className="user-profile-title">Profile</h2>
            <p>Username: {userProfile.username}</p>
            <p>Member Since: {formatDate(userProfile.member_since)}</p>
            <p>Reputation: {userProfile.reputation}</p>
          </div>

          {user.isAdmin && user._id === userProfile._id && (
            <>
              <div className="user-list">
                <h2>User List ({userProfile.users.length})</h2>
                {userProfile.users.length === 0 ? (
                  <p>No Users</p>
                ) : (
                  userProfile.users.map((displayedUser) => {
                    return (
                      <div key={displayedUser._id} className="user-card">
                        <p className="user-card-info">
                          <a href="/" onClick={(e) => handleUserClick(e, displayedUser)}>
                            {displayedUser.username} ({displayedUser.email})
                          </a>
                        </p>
                        <button onClick={() => setDeleteModalOpen(displayedUser)}>Delete</button>
                      </div>
                    );
                  })
                )}
              </div>

              {deleteModalOpen && (
                <Modal isOpen={true} onClose={() => setDeleteModalOpen(null)}>
                  <div className="tags-modal">
                    <p>Please confirm the deletion of the user '{deleteModalOpen.username}'</p>
                    <div className="tags-modal-buttons">
                      <button onClick={(e) => handleUserDelete(e, deleteModalOpen)}>Confirm</button>
                      <button onClick={() => setDeleteModalOpen(null)}>Cancel</button>
                    </div>
                  </div>
                </Modal>
              )}
            </>
          )}

          <div className="user-questions-asked">
            <h2>Questions Asked ({userProfile.questions_asked.length})</h2>
            {userProfile.questions_asked.length === 0 ? (
              <p>No Questions Asked</p>
            ) : (
              userProfile.questions_asked
                .sort((a, b) => new Date(b.ask_date_time) - new Date(a.ask_date_time))
                .map((question) => {
                  return (
                    <div key={question._id} className="user-question-info">
                      <p className="user-question-title">
                        <a href="/" onClick={(e) => handleQuestionClick(e, question)}>
                          {question.title}
                        </a>
                      </p>
                      <p className="user-question-metadata"> asked {formatDate(question.ask_date_time)}</p>
                    </div>
                  );
                })
            )}
          </div>
          <p className="user-questions-answered">
            <a href="/" onClick={(e) => handleQuestionsAnswered(e, userProfile._id)}>
              Questions Answered
            </a>
          </p>

          <p className="user-tags-created">
            <a href="/" onClick={(e) => handleTagsCreated(e, userProfile._id)}>
              Tags Created
            </a>
          </p>
        </div>
      )}
    </>
  );
};

export default UserProfile;
