import api from "./api";

const baseURI = "/api/storage";

const getFile = async (path: string[], filename: string): Promise<FileType> => {
  const URI = `${baseURI}/file/${[...path, filename].join("/")}`;
  const response = await api.get<FileType>(URI);
  return response.data;
};

const getFiles = async (path: string[]): Promise<FileType[]> => {
  const URI = `${baseURI}/files/${path.join("/")}`;
  const response = await api.get<FileType[]>(URI);
  return response.data;
};

// const downloadFile = async (path: string[], filename: string) => {
//   await api.get(`/api/storage/load/${path.join("/")}/${filename}`);
// };

const createDirectory = async (path: string[], directoryName: string) => {
  const URI = `${baseURI}/dir/${path.join("/")}?name=${directoryName}`;
  const response = await api.post(URI);
  return response.data;
};

const deleteFile = async (path: string[], filename: string) => {
  const URI = `${baseURI}/file/${[...path, filename].join("/")}`;
  await api.delete(URI);
};

const UserService = {
  getFile,
  getFiles,
  createDirectory,
  deleteFile,
};

export default UserService;
