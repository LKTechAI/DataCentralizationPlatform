import axios from "axios";

const api = axios.create({
  baseURL: "https://datacentralizationplatform.onrender.com", // your Flask backend
  timeout: 10000
});

// Optional: request / response interceptors for global error handling
api.interceptors.response.use(
  r => r,
  err => {
    console.error("API ERROR", err);
    return Promise.reject(err);
  }
);

export default api;
