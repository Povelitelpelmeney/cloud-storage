import { useCallback, useEffect, useRef, useState } from "react";
import { IconContext } from "react-icons";
import {
  FiCheck,
  FiUpload,
  FiFolderPlus,
  FiDownload,
  FiTrash2,
} from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { FcFile, FcFolder } from "react-icons/fc";
import UserService from "../../services/user-service";
import FileComponent from "../FileComponent/FileComponent";
import FileContexMenu from "../FileContexMenu/FileContexMenu";
import ModalWindow from "../ModalWindow/ModalWindow";
import useContextMenu from "../../hooks/useContextMenu";
import useModalWindow from "../../hooks/useModalWindow";
import "./Storage.scss";
import { AxiosError } from "axios";

const Storage = () => {
  const [path, setPath] = useState<string[]>([]);
  const [files, setFiles] = useState<FileType[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [disabledFiles, setDisabledFiles] = useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [draggedFile, setDraggedFile] = useState<string>("");
  const uploadInput = useRef<HTMLInputElement>(null);
  const fileIcon = useRef<HTMLDivElement>(null);
  const dirIcon = useRef<HTMLDivElement>(null);
  const { state: contextState, service: contextService } = useContextMenu();
  const { state: modalState, service: modalService } = useModalWindow();

  const selectFile = (fileId: string) => {
    const index = selectedFiles.indexOf(fileId);
    if (index === -1) setSelectedFiles((files) => [...files, fileId]);
    else setSelectedFiles((fileIds) => fileIds.filter((id) => fileId !== id));
  };

  const selectAll = () => {
    setSelectedFiles(files.map((file) => file.id));
  };

  const enableFile = (filename: string) => {
    setDisabledFiles((prevFiles) =>
      prevFiles.filter((name) => filename !== name)
    );
  };

  const disableFile = (filename: string) => {
    setDisabledFiles((prevFiles) => [...prevFiles, filename]);
  };

  const getNameById = (id: string) => {
    return files.find((file) => file.id === id)?.name;
  };

  const removeFile = (filename: string) => {
    setSelectedFiles((fileIds) =>
      fileIds.filter((id) => getNameById(id) !== filename)
    );
    setFiles((files) => files.filter((file) => file.name !== filename));
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    filename: string
  ) => {
    setDraggedFile(filename);
    let filesToMove = [];

    const selected = selectedFiles.some((id) => getNameById(id) === filename);

    if (selected) {
      filesToMove = selectedFiles.map(getNameById);
    } else {
      setSelectedFiles([]);
      filesToMove = [filename];
    }

    const type = files.find((file) => file.name === filename)!.type;
    const dragImage = document.getElementById("drag-icon")!;
    dragImage.innerHTML =
      type === "file"
        ? fileIcon.current!.innerHTML
        : dirIcon.current!.innerHTML;
    e.dataTransfer.setData("text/plain", JSON.stringify(filesToMove));
    e.dataTransfer.setDragImage(dragImage, 0, 0);
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

  const openUploadInput = () => {
    uploadInput.current?.click();
  };

  const gotoDirectory = (directoryName: string) => {
    if (disabledFiles.length > 0 || uploadingFiles.length > 0)
      modalService.showError("Previous task is in process, please wait.");
    else setPath((path) => [...path, directoryName]);
  };

  const goBack = () => {
    if (disabledFiles.length > 0 || uploadingFiles.length > 0)
      modalService.showError("Previous task is in process, please wait.");
    else if (path.length > 0) setPath((path) => path.slice(0, -1));
  };

  const getFiles = useCallback(async () => {
    const files = await UserService.getFiles(path);
    setFiles(files);
  }, [path]);

  const downloadFile = async (filename: string) => {
    const response = await UserService.downloadFile(path, filename);
    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: response.headers["content-type"] })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = decodeURIComponent(
      response.headers["content-disposition"].split("''")[1]
    );
    a.click();
  };

  const downloadSelected = async () => {
    const promises = selectedFiles
      .map(getNameById)
      .map((filename) => downloadFile(filename!));
    await Promise.all(promises);
  };

  const uploadFile = async (file: File, uploadPath: string[]) => {
    const formData = new FormData();
    formData.append("file", file, file.name);
    setUploadingFiles((prevFiles) => [...prevFiles, file.name]);
    const response = await UserService.uploadFile(uploadPath, formData).catch(
      (error: AxiosError) => {
        setUploadingFiles((prevFiles) =>
          prevFiles.filter((filename) => filename !== file.name)
        );
        throw error;
      }
    );
    if (path === uploadPath) {
      removeFile(response.name);
      setFiles((prevFiles) => [...prevFiles, response]);
      setUploadingFiles((prevFiles) =>
        prevFiles.filter((filename) => filename !== file.name)
      );
    }
  };

  const uploadFiles = async (files: File[], uploadPath: string[]) => {
    const promises = files.map((file) => uploadFile(file, uploadPath));
    await Promise.all(promises);
  };

  const createDirectory = async (directoryName: string) => {
    const response = await UserService.createDirectory(path, directoryName);
    setFiles((prevFiles) => [response, ...prevFiles]);
  };

  const moveFile = async (filename: string, targetDir: string) => {
    disableFile(filename);
    await UserService.moveFile(path, filename, targetDir).catch(
      (error: AxiosError<APIError>) => {
        enableFile(filename);
        throw error;
      }
    );
    removeFile(filename);
    enableFile(filename);
  };

  const moveFiles = async (filenames: string[], targetDir: string) => {
    const promises = filenames.map((filename) => moveFile(filename, targetDir));
    await Promise.all(promises);
  };

  const renameFile = async (filename: string, newName: string) => {
    disableFile(filename);
    const response = await UserService.renameFile(path, filename, newName);
    enableFile(filename);
    setFiles((prevFiles) =>
      prevFiles.map((file) => (file.name === filename ? response : file))
    );
  };

  const deleteFile = async (filename: string) => {
    setDisabledFiles((prevFiles) => [...prevFiles, filename]);
    await UserService.deleteFile(path, filename).catch(
      (error: AxiosError<APIError>) => {
        enableFile(filename);
        throw error;
      }
    );
    removeFile(filename);
    enableFile(filename);
  };

  const deleteSelected = async () => {
    const promises = selectedFiles
      .map(getNameById)
      .map((filename) => deleteFile(filename!));
    await Promise.all(promises);
  };

  const modalUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesToUpload = e.target.files ? Array.from(e.target.files) : [];
    uploadInput.current!.value = "";
    const uploadingNow = filesToUpload
      .map((file) => file.name)
      .some((name) => uploadingFiles.includes(name));
    if (uploadingNow) {
      modalService.showError("Uploading these files right now, please wait");
      return;
    }
    const duplicates = filesToUpload
      .map((file) => file.name)
      .filter((name) => files.map((file) => file.name).includes(name));
    if (duplicates.length > 0) {
      modalService.overwriteFiles(duplicates, async () => {
        await uploadFiles(filesToUpload, path).catch(
          (error: AxiosError<APIError>) => {
            if (error.response?.status === 400)
              modalService.showError(error.response?.data.message);
            throw error;
          }
        );
      });
    } else uploadFiles(filesToUpload, path);
  };

  const modalCreateDirectory = async () => {
    modalService.createDirectory(async (input?: string) => {
      if (input) return await createDirectory(input);
    });
  };

  const modalMoveFiles = async (filenames: string[], targetDir: string) => {
    const newPath =
      targetDir === "..." ? path.slice(0, -1) : [...path, targetDir];
    const response = await UserService.getFiles(newPath);
    const duplicates = response
      .filter((file) => filenames.includes(file.name))
      .map((file) => file.name);
    if (duplicates.length > 0) {
      modalService.overwriteFiles(duplicates, async () => {
        setSelectedFiles([]);
        await moveFiles(filenames, targetDir).catch(
          (error: AxiosError<APIError>) => {
            if (error.response?.status === 400)
              modalService.showError(error.response?.data.message);
            throw error;
          }
        );
      });
    } else await moveFiles(filenames, targetDir);
  };

  const modalRenameFile = async (filename: string) => {
    modalService.renameFile(filename, async (input?: string) => {
      if (input) return await renameFile(filename, input);
    });
  };

  const modalDeleteFile = async (filename: string) => {
    modalService.deleteFile(() => deleteFile(filename));
  };

  const modalDeleteSelected = async () => {
    modalService.deleteSelectedFiles(() => deleteSelected());
  };

  useEffect(() => {
    setSelectedFiles([]);
    getFiles();
  }, [getFiles]);

  return (
    <div className="storage">
      <input
        className="upload-input"
        ref={uploadInput}
        type="file"
        onChange={(e) => {
          modalUploadFiles(e).catch(() => {
            modalService.showError("Maximum upload size exceeded (1 GB)");
          });
        }}
        multiple
      />

      <div className="menu-bar">
        {selectedFiles.length === 0 ? (
          <IconContext.Provider value={{ className: "icon", size: "40" }}>
            <div className="icon-wrapper">
              <FiCheck onClick={selectAll} />
              <span className="icon-tooltip">Select all</span>
            </div>
            <div className="icon-wrapper">
              <FiUpload onClick={openUploadInput} />
              <span className="icon-tooltip">Upload files</span>
            </div>
            <div className="icon-wrapper">
              <FiFolderPlus onClick={modalCreateDirectory} />
              <span className="icon-tooltip">Create directory</span>
            </div>
          </IconContext.Provider>
        ) : (
          <IconContext.Provider value={{ className: "icon", size: "40" }}>
            <div className="icon-wrapper">
              <RxCross2 onClick={() => setSelectedFiles([])} />
              <span className="icon-tooltip">Cancel selection</span>
            </div>
            <div className="icon-wrapper">
              <FiDownload onClick={downloadSelected} />
              <span className="icon-tooltip">Download files</span>
            </div>
            <div className="icon-wrapper">
              <FiTrash2 onClick={modalDeleteSelected} />
              <span className="icon-tooltip">Delete files</span>
            </div>
          </IconContext.Provider>
        )}
      </div>

      <div className="files">
        {path.length > 0 && (
          <FileComponent
            name={"..."}
            type={"directory"}
            lastModified={-1}
            size={-1}
            disabled={false}
            goto={goBack}
            onDrop={modalMoveFiles}
          />
        )}

        {files.map((file) => (
          <FileComponent
            key={file.id}
            name={file.name}
            type={file.type}
            lastModified={file.lastModified}
            size={file.type === "file" ? file.size : -1}
            disabled={disabledFiles.includes(file.name)}
            selected={selectedFiles.includes(file.id)}
            dragged={draggedFile === file.name}
            select={() => selectFile(file.id)}
            {...(file.type === "directory" && {
              goto: () => gotoDirectory(file.name),
            })}
            onContexMenu={(e) => openContexMenu(e, file.name)}
            onDragStart={(e) => handleDragStart(e, file.name)}
            onDrop={modalMoveFiles}
          />
        ))}

        {uploadingFiles.map((filename) => (
          <FileComponent
            key={filename}
            name={filename}
            type={"file"}
            lastModified={-1}
            size={-1}
            disabled={true}
          />
        ))}
      </div>

      {contextState.active && (
        <FileContexMenu
          filename={contextState.filename}
          download={downloadFile}
          rename={modalRenameFile}
          delete={modalDeleteFile}
          top={contextState.point.y}
          left={contextState.point.x}
        />
      )}

      <ModalWindow state={modalState} onClose={modalService.closeModal} />

      <div className="file-icon-wrapper" ref={fileIcon}>
        <FcFile size={40} />
      </div>
      <div className="dir-icon-wrapper" ref={dirIcon}>
        <FcFolder size={40} />
      </div>
      <div id="drag-icon"></div>
    </div>
  );
};

export default Storage;
