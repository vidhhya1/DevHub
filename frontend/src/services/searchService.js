import axiosInstance from "../api/axios";

export const globalSearch = (query) =>
  axiosInstance.get("/search/", {
    params: {
      q: query,
    },
  });