import axios from "axios";
import { AUTH_TOKEN } from "./apiConstants";
import { useAuth } from "../AuthContext";

const axiosInstance = axios.create({
  // Your API base URL
  baseURL: "http://localhost:8000/",
});

// Add the interceptor to attach the authentication token to each request
axiosInstance.interceptors.request.use((config) => {
  // Get the authentication token from wherever you have stored it

  // Add the token to the request headers
  if (AUTH_TOKEN) {
    config.headers["Authorization"] = `Bearer ${AUTH_TOKEN}`;
  }

  return config;
});

// Add the interceptor to handle unauthorized responses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { setIsAuthenticated } = useAuth(); // Assuming you have a useAuth hook
    if (error.response && error.response.status === 401) {
      // Handle unauthorized response
      setIsAuthenticated(false);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
