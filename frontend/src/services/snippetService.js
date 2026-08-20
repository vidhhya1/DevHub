import axiosInstance from "../api/axios";

export const getSnippets = (
  projectId,
  params = {}
) =>
  axiosInstance.get(
    `/projects/${projectId}/snippets/`,
    { params }
  );

export const createSnippet = (
  projectId,
  data
) =>
  axiosInstance.post(
    `/projects/${projectId}/snippets/`,
    data
  );

export const updateSnippet = (
  projectId,
  snippetId,
  data
) =>
  axiosInstance.patch(
    `/projects/${projectId}/snippets/${snippetId}/`,
    data
  );

export const deleteSnippet = (
  projectId,
  snippetId
) =>
  axiosInstance.delete(
    `/projects/${projectId}/snippets/${snippetId}/`
  );