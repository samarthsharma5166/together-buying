import axios from "axios";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api").replace(/\/$/, "");

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});
