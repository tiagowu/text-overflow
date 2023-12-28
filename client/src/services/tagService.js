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

const tagService = {
  getAllTags: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tags`);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  updateTag: async (tagId, newTagData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tags/${tagId}`, newTagData);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  deleteTag: async (tagId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/tags/${tagId}`);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },
};

export default tagService;
