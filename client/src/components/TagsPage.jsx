import { useState } from "react";
import { useError } from "../context/ErrorContext";

import tagService from "../services/tagService";
import questionService from "../services/questionService";
import userService from "../services/userService";

import AskQuestionButton from "./AskQuestionButton";
import CustomInput from "./CustomInput";
import Modal from "./Modal";

import "../stylesheets/TagsPage.css";

const TagsPage = ({ user, onContentChange, title, tags, profile }) => {
  const { setError } = useError();
  const [displayedTags, setDisplayedTags] = useState(tags);
  const [tagName, setTagName] = useState("");
  const [tagNameError, setTagNameError] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(null);

  const rows = [];
  for (let i = 0; i < displayedTags.length; i += 3) {
    rows.push(displayedTags.slice(i, i + 3));
  }

  const handleTagClick = async (tag) => {
    try {
      const questions = await questionService.getAllQuestionsByTagId(tag._id);
      onContentChange({
        text: "questions",
        title: `Tag '${tag.name}'`,
        content: questions,
      });
    } catch (err) {
      setError(err);
    }
  };

  const handleEditTag = async (tagId, newTagName) => {
    try {
      if (!newTagName || newTagName.trim() === "") {
        setTagNameError("Tag name cannot be empty.");
        return;
      }

      await tagService.updateTag(tagId, { name: newTagName });
      const updatedTags = await userService.getUserTags(profile._id);
      setDisplayedTags(updatedTags);
    } catch (err) {
      setError(err);
    }
    setEditModalOpen(null);
    setTagName("");
  };

  const handleDeleteTag = async (tagId) => {
    try {
      await tagService.deleteTag(tagId);
      const updatedTags = await userService.getUserTags(profile._id);
      setDisplayedTags(updatedTags);
    } catch (err) {
      setError(err);
    }
    setDeleteModalOpen(null);
  };

  return (
    <div className="tags-page">
      <div className="tags-header">
        <h3>{displayedTags.length} Tags</h3>
        <h2>{title}</h2>
        <div className="ask-button-container">{user && <AskQuestionButton onContentChange={onContentChange} />}</div>
      </div>

      {profile && displayedTags.length === 0 && <p className="tags-message">No Tags Created</p>}
      <div className="tags-table-container">
        <table className="tags-table">
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="tags-table-row">
                {row.map((tag) => (
                  <td key={tag._id} className="tags-table-cell">
                    <a
                      href="/"
                      onClick={(e) => {
                        e.preventDefault();
                        handleTagClick(tag);
                      }}
                    >
                      {tag.name}
                    </a>
                    <p>{`${tag.questions} question${tag.questions === 1 ? "" : "s"}`}</p>

                    {profile && (
                      <div className="tags-buttons">
                        <button onClick={() => setEditModalOpen(tag)}>Edit</button>
                        <button onClick={() => setDeleteModalOpen(tag)}>Delete</button>
                      </div>
                    )}
                  </td>
                ))}
                {row.length < 3 && <td className="empty-tags-table-cell" colSpan={3 - row.length}></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editModalOpen && (
        <Modal isOpen={true} onClose={() => setEditModalOpen(null)}>
          <div className="tags-modal">
            <p>Please enter the new tag name for '{editModalOpen.name}': </p>
            <CustomInput id="tag-name" tag="input" value={tagName} onChange={(e) => setTagName(e.target.value)} error={tagNameError} />
            <div className="tags-modal-buttons">
              <button onClick={() => handleEditTag(editModalOpen._id, tagName)}>Confirm</button>
              <button onClick={() => setEditModalOpen(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {deleteModalOpen && (
        <Modal isOpen={true} onClose={() => setDeleteModalOpen(null)}>
          <div className="tags-modal">
            <p>Please confirm the deletion of the tag '{deleteModalOpen.name}'</p>
            <div className="tags-modal-buttons">
              <button onClick={() => handleDeleteTag(deleteModalOpen._id)}>Confirm</button>
              <button onClick={() => setDeleteModalOpen(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TagsPage;
