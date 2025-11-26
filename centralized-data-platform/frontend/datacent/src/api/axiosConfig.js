import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000", // your Flask backend
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
