import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { AxiosError } from "axios";
import { IconContext } from "react-icons";
import { FiUpload, FiFolderPlus, FiDownload, FiTrash2 } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import eventBus from "../../common/eventBus";
import UserService from "../../services/user-service";
import "./Storage.scss";

const Storage = () => {
  const [path, setPath] = useState<string[]>([]);
  const [files, setFiles] = useState<FileType[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileType[]>([]);
  const upload_input = useRef(null);
  const navigate = useNavigate();

  const handleErrorWrapper = () => {
    let alerted = false;

    const handleError = (error: AxiosError<APIError>) => {
      if (error.response?.status === 403) {
        if (!alerted) {
          eventBus.dispatch("logout");
          navigate("/login");
          window.location.reload();
          window.alert(
            "Your session has expired. Please make a new login request"
          );
          alerted = true;
        }
      } else console.error(error.response?.data?.message);
    };

    return handleError;
  };

  const handleError = handleErrorWrapper();

  const selectFile = (file: FileType) => {
    setSelectedFiles((prevSelectedFiles) => [...prevSelectedFiles, file]);
  };

  const cancelSelection = () => {
    setSelectedFiles([]);
  };

  const gotoDirectory = (directoryName: string) => {
    setPath((prevPath) => [...prevPath, directoryName]);
  };

  const goBack = () => {
    if (path.length > 0) setPath((prevPath) => prevPath.slice(0, -1));
  };

  const getFile = async (filename: string) => {
    return await UserService.getFile(path, filename);
  };

  const getFiles = useCallback(async () => {
    setFiles(await UserService.getFiles(path));
  }, [path]);

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
              <RxCross2 />
              <span className="icon-tooltip">Cancel selection</span>
            </div>
            <div className="icon-wrapper">
              <FiDownload />
              <span className="icon-tooltip">Download files</span>
            </div>
            <div className="icon-wrapper">
              <FiTrash2 />
              <span className="icon-tooltip">Delete files</span>
            </div>
          </IconContext.Provider>
        )}
      </div>

      <div className="files">
        {files.map((file) => (
          <div key={file.id}>
            <h3>{file.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Storage;
