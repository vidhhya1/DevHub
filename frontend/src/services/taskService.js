import axiosInstance from "../api/axios";

export const getTasks = (
  projectId,
  params = {}
) =>
  axiosInstance.get(
    `/projects/${projectId}/tasks/`,
    { params }
  );

export const createTask = (
  projectId,
  data
) =>
  axiosInstance.post(
    `/projects/${projectId}/tasks/`,
    data
  );

export const updateTask = (
  projectId,
  taskId,
  data
) =>
  axiosInstance.patch(
    `/projects/${projectId}/tasks/${taskId}/`,
    data
  );

export const deleteTask = (
  projectId,
  taskId
) =>
  axiosInstance.delete(
    `/projects/${projectId}/tasks/${taskId}/`
  );