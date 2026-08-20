import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const publicRoutes = [
  "/auth/login/",
  "/auth/register/",
  "/auth/refresh/",
];

axiosInstance.interceptors.request.use(
  (config) => {
    const url = config.url || "";

    const isPublicRoute =
      publicRoutes.some((route) =>
        url.endsWith(route)
      );

    if (!isPublicRoute) {
      const token =
        localStorage.getItem("access");

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) =>
    Promise.reject(error)
);

let refreshPromise = null;

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest =
      error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    const refresh =
      localStorage.getItem("refresh");

    if (!refresh) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");

      window.location.href = "/login";

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios.post(
          `${API_BASE_URL}/auth/refresh/`,
          {
            refresh,
          }
        );
      }

      const response =
        await refreshPromise;

      refreshPromise = null;

      const newAccess =
        response.data.access;

      localStorage.setItem(
        "access",
        newAccess
      );

      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccess}`;

      return axiosInstance(
        originalRequest
      );
    } catch (refreshError) {
      refreshPromise = null;

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");

      window.location.href = "/login";

      return Promise.reject(
        refreshError
      );
    }
  }
);

export default axiosInstance;