import axiosInstance from "../api/axios";

export const getActivities = (
  projectId,
  params = {}
) =>
  axiosInstance.get(
    `/projects/${projectId}/activities/`,
    { params }
  );