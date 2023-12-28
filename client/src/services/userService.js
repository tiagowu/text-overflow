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

const userService = {
  auth: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth`);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },
  signup: async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, userData);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },
  login: async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, userData);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },
  logout: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/logout`);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },
  getUserProfile: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/users/${userId}`);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  getUserTags: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}/tags`);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },

  getUserAnsweredQuestions: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}/answered`);
      return response.data;
    } catch (err) {
      throw handleError(err);
    }
  },
};

export default userService;
