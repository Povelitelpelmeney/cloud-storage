import { useCallback, useEffect, useRef, useState } from "react";
import { IconContext } from "react-icons";
import { FiUpload, FiFolderPlus, FiDownload, FiTrash2 } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import UserService from "../../services/user-service";
import FileComponent from "../FileComponent/FileComponent";
import FileContexMenu from "../FileContexMenu/FileContexMenu";
import ModalWindow from "../ModalWindow/ModalWindow";
import useContextMenu from "../../hooks/useContextMenu";
import useModalWindow from "../../hooks/useModalWindow";
import "./Storage.scss";

const Storage = () => {
  const [path, setPath] = useState<string[]>([]);
  const [files, setFiles] = useState<FileType[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const uploadInput = useRef(null);
  const { state: contextState, service: contextService } = useContextMenu();
  // const { state: modalState, service: modalService } = useModalWindow();

  const selectFile = (fileId: number) => {
    const index = selectedFiles.indexOf(fileId);
    if (index === -1) setSelectedFiles((files) => [...files, fileId]);
    else setSelectedFiles((files) => files.filter((name) => fileId !== name));
  };

  const cancelSelection = () => {
    setSelectedFiles([]);
  };

  const openContexMenu = (
    e: React.MouseEvent<HTMLDivElement>,
    filename: string
  ) => {
    e.preventDefault();
    contextService.setActiveState(true);
    contextService.setFilename(filename);
    contextService.setPoint({ x: e.pageX, y: e.pageY });
  };

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

  const downloadFile = async (filename: string) => {
    const response = await UserService.downloadFile(path, filename);
    let url = window.URL.createObjectURL(
      new Blob([response.data], { type: response.headers["content-type"] })
    );
    let a = document.createElement("a");
    a.href = url;
    a.download = decodeURIComponent(
      response.headers["content-disposition"].split("''")[1]
    );
    a.click();
  };

  const downloadSelected = async () => {
    const promises = selectedFiles
      .map((id) => files.find((file) => file.id === id)!.name)
      .map((filename) => downloadFile(filename));
    await Promise.all(promises);
  };

  const createDirectory = async (directoryName: string) => {
    const response = await UserService.createDirectory(path, directoryName);
    setFiles((prevFiles) => [response, ...prevFiles]);
  };

  // const createDirectoryWrapper = () => {
  //   modalService.makeDirectory("Create directory", async (name: string) => {
  //     const response = await createDirectory(name).catch(handleError);
  //     if (response) return response;
  //     else modalService.closeModal();
  //   });
  // };

  const deleteFile = async (filename: string) => {
    await UserService.deleteFile(path, filename);
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== filename));
  };

  const deleteSelected = async () => {
    const promises = selectedFiles
      .map((id) => files.find((file) => file.id === id)!.name)
      .map((filename) => deleteFile(filename));
    await Promise.all(promises);
  };

  useEffect(() => {
    getFiles();
  }, [getFiles]);

  return (
    <div className="storage">
      <input className="upload-input" ref={uploadInput} type="file" multiple />

      <div className="menu-bar">
        {selectedFiles.length === 0 ? (
          <IconContext.Provider value={{ className: "icon", size: "40" }}>
            <div className="icon-wrapper">
              <FiUpload />
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
              <FiDownload onClick={downloadSelected} />
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
            selected={selectedFiles.some((id) => id === file.id)}
            select={() => selectFile(file.id)}
            {...(file.type === "directory" && {
              goto: () => gotoDirectory(file.name),
            })}
            onContexMenu={(e) => openContexMenu(e, file.name)}
          />
        ))}
      </div>

      {contextState.active && (
        <FileContexMenu
          filename={contextState.filename}
          download={downloadFile}
          delete={deleteFile}
          top={contextState.point.y}
          left={contextState.point.x}
        />
      )}

      {/* {modalState.type !== "hidden" && (
        <ModalWindow state={modalState} />
      )} */}
    </div>
  );
};

export default Storage;
