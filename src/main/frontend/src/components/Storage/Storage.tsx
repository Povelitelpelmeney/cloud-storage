import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { AxiosError } from "axios";
import { IconContext } from "react-icons";
import { FiUpload, FiFolderPlus, FiDownload, FiTrash2 } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import eventBus from "../../common/eventBus";
import UserService from "../../services/user-service";
import FileComponent from "../FileComponent/FileComponent";
import FileContexMenu from "../FileContexMenu/FileContexMenu";
import useContextMenu from "../../hooks/useContextMenu";
import "./Storage.scss";

const Storage = () => {
  const [path, setPath] = useState<string[]>([]);
  const [files, setFiles] = useState<FileType[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const upload_input = useRef(null);
  const navigate = useNavigate();
  // const { clicked, setClicked, point, setPoint } = useContextMenu();

  const selectFile = (fileId: number) => {
    const index = selectedFiles.indexOf(fileId);
    if (index === -1) setSelectedFiles((files) => [...files, fileId]);
    else setSelectedFiles((files) => files.filter((name) => fileId !== name));
  };

  const cancelSelection = () => {
    setSelectedFiles([]);
  };

  const handleError = useCallback(
    (error: AxiosError<APIError>) => {
      if (error.response?.status === 403) {
        eventBus.dispatch("logout");
        navigate("/login");
        window.alert(
          "Your session has expired. Please make a new login request"
        );
      } else console.error(error.response?.data?.message, error);
    },
    [navigate]
  );

  const gotoDirectory = (directoryName: string) => {
    setPath((path) => [...path, directoryName]);
  };

  const goBack = () => {
    if (path.length > 0) setPath((path) => path.slice(0, -1));
  };

  const getFile = async (filename: string) => {
    return await UserService.getFile(path, filename);
  };

  const getFiles = useCallback(async () => {
    cancelSelection();
    const files = await UserService.getFiles(path);
    setFiles(files);
  }, [path]);

  const deleteFile = async (filename: string) => {
    await UserService.deleteFile(path, filename);
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== filename));
  };

  const deleteSelected = async () => {
    const promises = selectedFiles
      .map((fileId) => files.find((file) => file.id === fileId)!.name)
      .map((filename) => deleteFile(filename));
    await Promise.all(promises);
  };

  useEffect(() => {
    getFiles().catch(handleError);
  }, [getFiles, handleError]);

  return (
    <div className="storage">
      <input className="upload-input" ref={upload_input} type="file" multiple />

      <div className="menu-bar">
        {selectedFiles.length === 0 ? (
          <IconContext.Provider value={{ className: "icon", size: "40" }}>
            <div className="icon-wrapper">
              <FiUpload onClick={console.log} />
              <span className="icon-tooltip">Upload files</span>
            </div>
            <div className="icon-wrapper">
              <FiFolderPlus />
              <span className="icon-tooltip">Create directory</span>
            </div>
          </IconContext.Provider>
        ) : (
          <IconContext.Provider value={{ className: "icon", size: "40" }}>
            <div className="icon-wrapper">
              <RxCross2 onClick={cancelSelection} />
              <span className="icon-tooltip">Cancel selection</span>
            </div>
            <div className="icon-wrapper">
              <FiDownload />
              <span className="icon-tooltip">Download files</span>
            </div>
            <div className="icon-wrapper">
              <FiTrash2 onClick={deleteSelected} />
              <span className="icon-tooltip">Delete files</span>
            </div>
          </IconContext.Provider>
        )}
      </div>

      <div className="files">
        {path.length > 0 && (
          <FileComponent
            id={0}
            name={"..."}
            type={"directory"}
            lastModified={0}
            size={0}
            goto={goBack}
          />
        )}

        {files.map((file) => (
          <FileComponent
            key={file.id}
            id={file.id}
            name={file.name}
            type={file.type}
            lastModified={file.lastModified}
            size={file.size}
            selected={selectedFiles.some((fileId) => fileId === file.id)}
            select={() => selectFile(file.id)}
            {...(file.type === "directory" && {
              goto: () => gotoDirectory(file.name),
            })}
          />
        ))}
      </div>
    </div>
  );
};

export default Storage;
