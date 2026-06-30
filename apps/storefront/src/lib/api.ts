// Base URL for the backend API. Configured at build time via VITE_API_URL
// (set in apps/frontend/.env locally and in Render's static-site env).
// Falls back to the local backend for development.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000";
