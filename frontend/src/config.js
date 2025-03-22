// frontend/src/config.js
const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8001/api"
    : "/api";

export default API_BASE_URL;
