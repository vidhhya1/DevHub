import axiosInstance from "../api/axios";

export const getProjectDashboard = (projectId) =>
  axiosInstance.get(
    `/projects/${projectId}/dashboard/`
  );