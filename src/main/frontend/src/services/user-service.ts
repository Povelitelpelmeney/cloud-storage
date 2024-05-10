import api from "./api";

const baseURL = "/api/storage/";

const getFile = async (path: string[], filename: string): Promise<FileType> => {
  const URI = `/api/storage/file/${[...path, filename].join("/")}`;
  const response = await api.get<FileType>(URI);
  return response.data;
};

const getFiles = async (path: string[]): Promise<FileType[]> => {
  const URI = `/api/storage/files/${path.join("/")}`;
  const response = await api.get<FileType[]>(URI);
  return response.data;
};

// const downloadFile = async (path: string[], filename: string) => {
//   await api.get(`/api/storage/load/${path.join("/")}/${filename}`);
// };

const createDirectory = async (path: string[], directoryName: string) => {
  const URI = `/api/storage/dir/${path.join("/")}?name=${directoryName}`;
  const response = await api.post(URI);
  return response.data;
};

const deleteFile = async (path: string[], filename: string) => {
  const URI = `/api/storage/file/${[...path, filename].join("/")}`;
  await api.delete(URI);
};

const UserService = {
  getFile,
  getFiles,
  createDirectory,
  deleteFile,
};

export default UserService;
