import axiosInstance from "../api/axios";

export const getProjects = (params = {}) =>
  axiosInstance.get("/projects/", { params });

export const getProject = (id) =>
  axiosInstance.get(`/projects/${id}/`);

export const createProject = (data) =>
  axiosInstance.post("/projects/", data);

export const updateProject = (id, data) =>
  axiosInstance.patch(`/projects/${id}/`, data);

export const deleteProject = (id) =>
  axiosInstance.delete(`/projects/${id}/`);

export const getMembers = (projectId) =>
  axiosInstance.get(
    `/projects/${projectId}/members/`
  );

export const addMember = (projectId, data) =>
  axiosInstance.post(
    `/projects/${projectId}/members/`,
    data
  );

export const updateMember = (
  projectId,
  memberId,
  data
) =>
  axiosInstance.patch(
    `/projects/${projectId}/members/${memberId}/`,
    data
  );

export const deleteMember = (
  projectId,
  memberId
) =>
  axiosInstance.delete(
    `/projects/${projectId}/members/${memberId}/`
  );