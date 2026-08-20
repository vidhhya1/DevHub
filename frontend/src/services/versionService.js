import axiosInstance from "../api/axios";

export const getVersions = (snippetId) =>
  axiosInstance.get(
    `/snippets/${snippetId}/versions/`
  );

export const getVersion = (
  snippetId,
  versionId
) =>
  axiosInstance.get(
    `/snippets/${snippetId}/versions/${versionId}/`
  );