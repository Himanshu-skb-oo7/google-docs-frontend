import axios from "axios";
import { AUTH_TOKEN } from "./apiConstants";

const axiosInstance = axios.create({
  // Your API base URL
  baseURL: "http://localhost:8000/",
});

// Add the interceptor to attach the authentication token to each request
axiosInstance.interceptors.request.use((config) => {
  // Get the authentication token from wherever you have stored it

  // Add the token to the request headers
  if (AUTH_TOKEN) {
    config.headers["Authorization"] = `Token ${AUTH_TOKEN}`;
  }

  return config;
});

export default axiosInstance;
