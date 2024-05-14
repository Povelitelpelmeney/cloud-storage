import api from "./api";

const baseURI = "/api/storage";

const loadFile = async (path: string[], source: string): Promise<FileType> => {
  const encodedPath = path.map((dir) => encodeURIComponent(dir)).join("/");
  const encodedSource = encodeURIComponent(source);
  const URI =
    path.length > 0
      ? `${baseURI}/file/${encodedPath}?src=${encodedSource}`
      : `${baseURI}/file?src=${encodedSource}`;
  const response = await api.get<FileType>(URI);
  return response.data;
};

const loadDirectory = async (path: string[]): Promise<FileType[]> => {
  const encodedPath = path.map((dir) => encodeURIComponent(dir)).join("/");
  const URI = `${baseURI}/files/${encodedPath}`;
  const response = await api.get<FileType[]>(URI);
  return response.data;
};

const downloadFile = async (path: string[], source: string) => {
  const encodedPath = path.map((dir) => encodeURIComponent(dir)).join("/");
  const encodedSource = encodeURIComponent(source);
  const URI =
    path.length > 0
      ? `${baseURI}/load/${encodedPath}?src=${encodedSource}`
      : `${baseURI}/load?src=${encodedSource}`;
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

const uploadFiles = async (path: string[], formData: FormData) => {
  const encodedPath = path.map((dir) => encodeURIComponent(dir)).join("/");
  const URI = `${baseURI}/files/${encodedPath}`;
  const response = await api.post<FileType[]>(URI, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const createDirectory = async (path: string[], name: string) => {
  const encodedPath = path.map((dir) => encodeURIComponent(dir)).join("/");
  const encodedName = encodeURIComponent(name);
  const URI =
    path.length > 0
      ? `${baseURI}/dir/${encodedPath}?name=${encodedName}`
      : `${baseURI}/dir?name=${encodedName}`;
  const response = await api.post<FileType>(URI);
  return response.data;
};

const moveFile = async (
  path: string[],
  source: string,
  destination: string
) => {
  const encodedPath = path.map((dir) => encodeURIComponent(dir)).join("/");
  const encodedSource = encodeURIComponent(source);
  const encodedDestination = encodeURIComponent(destination);
  const URI =
    path.length > 0
      ? `${baseURI}/file?src=${encodedSource}&dest=${encodedDestination}`
      : `${baseURI}/file/${encodedPath}?src=${encodedSource}&dest=${encodedDestination}`;
  const response = await api.put<FileType>(URI);
  return response.data;
};

const moveFiles = async (
  path: string[],
  sources: string[],
  destination: string
) => {
  const encodedPath = path.map((dir) => encodeURIComponent(dir)).join("/");
  const encodedSources = sources
    .map((source) => encodeURIComponent(source))
    .join("<");
  const encodedDestination = encodeURIComponent(destination);
  console.log(encodedPath, encodedSources, encodedDestination);
  const URI =
    path.length > 0
      ? `${baseURI}/files/${encodedPath}?src=${encodedSources}&dest=${encodedDestination}`
      : `${baseURI}/files?src=${encodedSources}&dest=${encodedDestination}`;
  const response = await api.put<FileType[]>(URI);
  return response.data;
};

const renameFile = async (path: string[], source: string, name: string) => {
  const encodedPath = path.map((dir) => encodeURIComponent(dir)).join("/");
  const encodedSource = encodeURIComponent(source);
  const encodedName = encodeURIComponent(name);
  const URI =
    path.length > 0
      ? `${baseURI}/file/${encodedPath}?src=${encodedSource}&name=${encodedName}`
      : `${baseURI}/file?src=${encodedSource}&name=${encodedName}`;
  const response = await api.patch<FileType>(URI);
  return response.data;
};

const deleteFile = async (path: string[], source: string) => {
  const encodedPath = path.map((dir) => encodeURIComponent(dir)).join("/");
  const encodedSource = encodeURIComponent(source);
  const URI =
    path.length > 0
      ? `${baseURI}/file/${encodedPath}?src=${encodedSource}`
      : `${baseURI}/file?src=${encodedSource}`;
  await api.delete(URI);
};

const deleteFiles = async (path: string[], sources: string[]) => {
  const encodedPath = path.map((dir) => encodeURIComponent(dir)).join("/");
  const encodedSource = sources
    .map((source) => encodeURIComponent(source))
    .join("<");
  const URI =
    path.length > 0
      ? `${baseURI}/files/${encodedPath}?src=${encodedSource}`
      : `${baseURI}/files?src=${encodedSource}`;
  await api.delete(URI);
};

const UserService = {
  loadFile,
  loadDirectory,
  downloadFile,
  uploadFile,
  uploadFiles,
  createDirectory,
  moveFile,
  moveFiles,
  renameFile,
  deleteFile,
  deleteFiles,
};

export default UserService;
