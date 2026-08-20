import axiosInstance from "../api/axios";

export const getTags = () =>
  axiosInstance.get("/tags/");

export const createTag = (data) =>
  axiosInstance.post("/tags/", data);