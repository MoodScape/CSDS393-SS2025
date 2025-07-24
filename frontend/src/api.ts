export const API_BASE_URL =
  (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost')
    ? 'http://localhost:5001'
    : 'https://csds393-ss2025-backend.onrender.com'; 