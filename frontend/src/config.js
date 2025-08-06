// frontend/src/config.js
const backendURL =
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000"
    : "https://to-do-list-rd-production.up.railway.app";

export default backendURL;
