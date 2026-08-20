import axiosInstance from "../api/axios";

export const getReviews = (taskId) =>
  axiosInstance.get(
    `/tasks/${taskId}/reviews/`
  );

export const createReview = (
  taskId,
  data
) =>
  axiosInstance.post(
    `/tasks/${taskId}/reviews/`,
    data
  );

export const updateReview = (
  taskId,
  reviewId,
  data
) =>
  axiosInstance.patch(
    `/tasks/${taskId}/reviews/${reviewId}/`,
    data
  );

export const deleteReview = (
  taskId,
  reviewId
) =>
  axiosInstance.delete(
    `/tasks/${taskId}/reviews/${reviewId}/`
  );