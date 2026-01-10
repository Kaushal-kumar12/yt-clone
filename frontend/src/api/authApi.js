import axios from "axios";

export const loginUser = (data) =>
  axios.post("https://yt-clone-rust.vercel.app/api/auth/login", data);

export const registerUser = (data) =>
  axios.post("https://yt-clone-rust.vercel.app/api/auth/register", data);
