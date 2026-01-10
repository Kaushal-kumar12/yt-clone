import axios from "axios";

export const loginUser = (data) =>
  axios.post("http://localhost:5000/api/auth/login", data);

export const registerUser = (data) =>
  axios.post("http://localhost:5000/api/auth/register", data);
