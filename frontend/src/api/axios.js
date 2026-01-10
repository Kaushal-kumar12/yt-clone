import axios from "axios";

const instance = axios.create({
  baseURL: "https://yt-clone-rust.vercel.app/api",
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
   🔥 AUTO LOGOUT ON 401
========================= */
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 🔐 Token expired or invalid
      localStorage.clear();

      // Prevent infinite redirect loop
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
