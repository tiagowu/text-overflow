import axios from "axios";

axios.defaults.withCredentials = true;
const API_BASE_URL = "http://localhost:8000";

const handleError = (err) => {
  let errorMessage;

  if (err && err.code === "ERR_NETWORK") {
    errorMessage = "Server is currently unavailable. Please try again later.";
  } else if (err.response && err.response.data && err.response.data.error) {
    errorMessage = err.response.data.error;
  } else {
    errorMessage = "An unexpected error occurred.";
  }

  return errorMessage;
};

const questionService = {
  getAllQuestions: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/questions`);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  getAllQuestionsByTagId: async (tagId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/questions/tag/${tagId}`);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  createQuestion: async (questionData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/questions`, questionData);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  getQuestion: async (questionId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/questions/${questionId}`);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  updateQuestion: async (questionId, newQuestionData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/questions/${questionId}`, newQuestionData);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  deleteQuestion: async (questionId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/questions/${questionId}`);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  createAnswer: async (questionId, answerData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/questions/${questionId}/answers`, answerData);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  updateAnswer: async (questionId, answerId, newAnswerData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/questions/${questionId}/answers/${answerId}`, newAnswerData);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  deleteAnswer: async (questionId, answerId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/questions/${questionId}/answers/${answerId}`);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  createQuestionComment: async (questionId, commentData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/questions/${questionId}/comments`, commentData);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  upvoteQuestion: async (questionId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/questions/${questionId}/upvote`);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  downvoteQuestion: async (questionId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/questions/${questionId}/downvote`);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },
};

export default questionService;
