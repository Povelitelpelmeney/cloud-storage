import api from "./api";

const baseURI = "/api/storage";

const getFile = async (path: string[], filename: string): Promise<FileType> => {
  const encodedPath = [
    ...path.map((dir) => encodeURIComponent(dir)),
    encodeURIComponent(filename),
  ].join("/");
  const URI = `${baseURI}/file/${encodedPath}`;
  const response = await api.get<FileType>(URI);
  return response.data;
};

const getFiles = async (path: string[]): Promise<FileType[]> => {
  const encodedPath = path.map((dir) => encodeURIComponent(dir)).join("/");
  const URI = `${baseURI}/files/${encodedPath}`;
  const response = await api.get<FileType[]>(URI);
  return response.data;
};

const downloadFile = async (path: string[], filename: string) => {
  const encodedPath = [
    ...path.map((dir) => encodeURIComponent(dir)),
    encodeURIComponent(filename),
  ].join("/");
  const URI = `${baseURI}/load/${encodedPath}`;
  return await api.get<Blob>(URI, { responseType: "blob" });
};

const uploadFile = async (path: string[], formData: FormData) => {
  const encodedPath = path.map((dir) => encodeURIComponent(dir)).join("/");
  const URI = `${baseURI}/file/${encodedPath}`;
  const response = await api.post<FileType>(URI, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const createDirectory = async (path: string[], directoryName: string) => {
  const encodedPath = path.map((dir) => encodeURIComponent(dir)).join("/");
  const encodedName = encodeURIComponent(directoryName);
  const URI =
    path.length > 0
      ? `${baseURI}/dir/${encodedPath}?name=${encodedName}`
      : `${baseURI}/dir?name=${encodedName}`;
  const response = await api.post<FileType>(URI);
  return response.data;
};

const renameFile = async (
  path: string[],
  filename: string,
  newName: string
) => {
  const encodedPath = [
    ...path.map((dir) => encodeURIComponent(dir)),
    encodeURIComponent(filename),
  ].join("/");
  const encodedName = encodeURIComponent(newName);
  const URI = `${baseURI}/file/${encodedPath}?name=${encodedName}`;
  await api.patch(URI);
};

const moveFile = async (
  path: string[],
  filename: string,
  targetDir: string
) => {
  const encodedPath = [
    ...path.map((dir) => encodeURIComponent(dir)),
    encodeURIComponent(filename),
  ].join("/");
  const encodedName = encodeURIComponent(targetDir);
  const URI = `${baseURI}/file/${encodedPath}?target=${encodedName}`;
  await api.put(URI);
};

const deleteFile = async (path: string[], filename: string) => {
  const encodedPath = [
    ...path.map((dir) => encodeURIComponent(dir)),
    encodeURIComponent(filename),
  ].join("/");
  const URI = `${baseURI}/file/${encodedPath}`;
  await api.delete(URI);
};

const UserService = {
  getFile,
  getFiles,
  downloadFile,
  uploadFile,
  createDirectory,
  renameFile,
  moveFile,
  deleteFile,
};

export default UserService;
