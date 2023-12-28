import axios from "axios";

axios.defaults.withCredentials = true;
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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

const answerService = {
  createAnswerComment: async (answerId, commentData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/answers/${answerId}/comments`, commentData);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },
  upvoteAnswer: async (answerId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/answers/${answerId}/upvote`);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },
  downvoteAnswer: async (answerId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/answers/${answerId}/downvote`);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },
};

export default answerService;
