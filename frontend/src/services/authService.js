import api from "../api/axios";

export function registerUser(data) {
  return api.post("/auth/register/", data);
}

export function loginUser(data) {
  return api.post("/auth/login/", data);
}

export function refreshToken(refresh) {
  return api.post("/auth/refresh/", {
    refresh,
  });
}

export function getCurrentUser() {
  return api.get("/auth/me/");
}

export function logoutUser(refresh) {
  return api.post("/auth/logout/", {
    refresh,
  });
}