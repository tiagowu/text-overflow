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

const commentService = {
  upvoteComment: async (commentId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/comments/${commentId}/upvote`);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },
};

export default commentService;
