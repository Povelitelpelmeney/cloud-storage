import api from "./api";

const getFile = async (path: string[], filename: string): Promise<FileType> => {
  const response = await api.get<FileType>(
    `/api/storage/file/${path.join("/")}/${filename}`
  );
  return response.data;
};

const getFiles = async (path: string[]): Promise<FileType[]> => {
  const response = await api.get<FileType[]>(
    `/api/storage/files/${path.join("/")}`
  );
  return response.data;
};

// const downloadFile = async (path: string[], filename: string) => {
//   await api.get(`/api/storage/load/${path.join("/")}/${filename}`);
// };

const UserService = {
  getFile,
  getFiles,
};

export default UserService;
