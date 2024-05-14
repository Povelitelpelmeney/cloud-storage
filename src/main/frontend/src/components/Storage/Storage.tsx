import { useCallback, useEffect, useRef, useState } from "react";
import { AxiosError } from "axios";
import { IconContext } from "react-icons";
import { FiUpload, FiFolderPlus, FiDownload, FiTrash2 } from "react-icons/fi";
import { RxCheck, RxCross2 } from "react-icons/rx";
import { FcFile, FcFolder } from "react-icons/fc";
import UserService from "../../services/user-service";
import FileComponent from "../FileComponent/FileComponent";
import FileContextMenu from "../FileContextMenu/FileContextMenu";
import ModalWindow from "../ModalWindow/ModalWindow";
import useContextMenu from "../../hooks/useContextMenu";
import useModalWindow from "../../hooks/useModalWindow";
import "./Storage.scss";

const Storage = () => {
  const [inRoot, setInRoot] = useState<boolean>(true);
  const [path, setPath] = useState<string[]>([]);
  const [files, setFiles] = useState<FileType[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [processed, setProcessed] = useState<[string, string[]][]>([]);
  const [dragged, setDragged] = useState<string>("");
  const pathRef = useRef<string[]>(path);
  const uploadInput = useRef<HTMLInputElement>(null);
  const fileIcon = useRef<HTMLDivElement>(null);
  const dirIcon = useRef<HTMLDivElement>(null);
  const { state: contextState, service: contextService } = useContextMenu();
  const { state: modalState, service: modalService } = useModalWindow();

  const selectFile = (fileId: string) => {
    setSelected((prevFiles) => [...prevFiles, fileId]);
  };

  const unselectFile = (fileId: string) => {
    setSelected((prevFiles) => prevFiles.filter((id) => id !== fileId));
  };

  const selectAll = () => {
    setSelected(files.map((file) => file.id));
  };

  const addProcessedFile = (name: string, path: string[]) => {
    setProcessed((prevFiles) => [...prevFiles, [name, path]]);
  };

  const removeProcessedFile = (name: string, path: string[]) => {
    setProcessed((prevFiles) =>
      prevFiles.filter(
        ([filename, filepath]) =>
          filename !== name || filepath.join("/") !== path.join("/")
      )
    );
  };

  const getNameById = (id: string) => {
    return files.find((file) => file.id === id)?.name;
  };

  const removeFile = (filename: string) => {
    removeProcessedFile(filename, pathRef.current);
    setSelected((fileIds) =>
      fileIds.filter((id) => getNameById(id) !== filename)
    );
    setFiles((files) => files.filter((file) => file.name !== filename));
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    filename: string
  ) => {
    setDragged(filename);
    let filesToMove = [];

    if (selected.some((id) => getNameById(id) === filename)) {
      filesToMove = selected.map(getNameById);
    } else {
      setSelected([]);
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
    setPath((path) => [...path, directoryName]);
  };

  const goBack = () => {
    if (path.length > 0) setPath((path) => path.slice(0, -1));
  };

  const getFiles = useCallback(async () => {
    const files = await UserService.loadDirectory(pathRef.current);
    setFiles(files);
    path.length > 0 ? setInRoot(false) : setInRoot(true);
  }, [path]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const promises = selected
      .map(getNameById)
      .map((filename) => downloadFile(filename!));
    await Promise.all(promises);
  };

  const uploadFiles = async (files: File[]) => {
    const srcPath = [...path];
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file, file.name);
      addProcessedFile(file.name, srcPath);
    });

    try {
      const response = await UserService.uploadFiles(srcPath, formData);

      response.forEach((file) => removeProcessedFile(file.name, srcPath));
      if (pathRef.current.join("/") === srcPath.join("/")) {
        response.forEach((file) => removeFile(file.name));
        setFiles((prevFiles) => [...prevFiles, ...response]);
      }
    } catch (error: unknown) {
      files.forEach((file) => removeProcessedFile(file.name, srcPath));
      if (error instanceof AxiosError && error.response?.status === 400) {
        const invalidFilename = error.response?.data.message.split(/[[\]]/)[1];
        const invalidIndex = files
          .map((file) => file.name)
          .indexOf(invalidFilename);

        if (pathRef.current.join("/") === srcPath.join("/")) {
          const uploadedFiles = files
            .filter((_, index) => index < invalidIndex)
            .map((file) => {
              return {
                id: crypto.randomUUID?.(),
                name: file.name,
                type: "file",
                lastModified: file.lastModified,
                size: file.size,
              };
            });
          setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
        }
      }
      throw error;
    }
  };

  const createDirectory = async (directoryName: string) => {
    const response = await UserService.createDirectory(path, directoryName);
    setFiles((prevFiles) => [response, ...prevFiles]);
  };

  const moveFiles = async (filenames: string[], destination: string) => {
    const srcPath = [...path];
    const destPath =
      destination === "..." ? path.slice(0, -1) : [...path, destination];
    setSelected([]);
    filenames.forEach((filename) => addProcessedFile(filename, path));

    try {
      const response = await UserService.moveFiles(
        srcPath,
        filenames,
        destination
      );

      response.forEach((file) => removeProcessedFile(file.name, srcPath));
      if (pathRef.current.join("/") === srcPath.join("/")) {
        filenames.forEach((filename) => removeFile(filename));
      } else if (pathRef.current.join("/") === destPath.join("/")) {
        response.forEach((file) => {
          removeFile(file.name);
          setFiles((prevFiles) => [...prevFiles, file]);
        });
      }
    } catch (error: unknown) {
      filenames.forEach((filename) => removeProcessedFile(filename, srcPath));
      if (error instanceof AxiosError && error.response?.status === 400) {
        const invalidFilename = error.response?.data.message.split(/[[\]]/)[1];
        const invalidIndex = filenames.indexOf(invalidFilename);

        if (pathRef.current.join("/") === srcPath.join("/"))
          filenames
            .filter((_, index) => index < invalidIndex)
            .forEach((filename) => removeFile(filename));
        else if (pathRef.current.join("/") === destPath.join("/")) getFiles();
      }
      throw error;
    }
  };

  const renameFile = async (filename: string, name: string) => {
    const response = await UserService.renameFile(path, filename, name);
    setFiles((prevFiles) =>
      prevFiles.map((file) => (file.name === filename ? response : file))
    );
  };

  const deleteFile = async (filename: string) => {
    const srcPath = [...path];
    unselectFile(getNameById(filename) || "");
    addProcessedFile(filename, srcPath);

    try {
      await UserService.deleteFile(srcPath, filename);
      removeProcessedFile(filename, srcPath);
      if (pathRef.current.join("/") === srcPath.join("/")) removeFile(filename);
    } catch (error: unknown) {
      removeProcessedFile(filename, srcPath);
      throw error;
    }
  };

  const deleteFiles = async (filenames: string[]) => {
    const srcPath = [...path];
    setSelected([]);
    filenames.forEach((filename) => addProcessedFile(filename, srcPath));

    try {
      await UserService.deleteFiles(srcPath, filenames);
      filenames.forEach((filename) => removeProcessedFile(filename, srcPath));
      if (pathRef.current.join("/") === srcPath.join("/"))
        filenames.forEach((filename) => removeFile(filename));
    } catch (error: unknown) {
      filenames.forEach((filename) => removeProcessedFile(filename, srcPath));
      throw error;
    }
  };

  const modalUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesToUpload = e.target.files ? Array.from(e.target.files) : [];
    uploadInput.current!.value = "";

    const processingNow = filesToUpload
      .map((file) => file.name)
      .some((filename) => processed.includes([filename, path]));

    if (processingNow) {
      modalService.showError("Processing these files right now, please wait");
      return;
    }

    const duplicates = filesToUpload
      .map((file) => file.name)
      .filter((name) => files.map((file) => file.name).includes(name));

    if (duplicates.length > 0) {
      modalService.overwriteFiles(duplicates, async () => {
        try {
          await uploadFiles(filesToUpload);
          modalService.closeModal();
        } catch (error: unknown) {
          if (error instanceof AxiosError && error.response?.status === 400)
            modalService.showError(error.response?.data.message);
          else if (error instanceof AxiosError && error.code === "ERR_NETWORK")
            modalService.showError("Maximum upload size exceeded (1 GB)");
          else {
            modalService.closeModal();
            throw error;
          }
        }
      });
    } else await uploadFiles(filesToUpload);
  };

  const modalCreateDirectory = async () => {
    modalService.createDirectory(async (input?: string) => {
      try {
        if (input) await createDirectory(input);
        modalService.closeModal();
      } catch (error: unknown) {
        if (!(error instanceof AxiosError) || error.response?.status !== 400)
          modalService.closeModal();
        throw error;
      }
    });
  };

  const modalMoveFiles = async (filenames: string[], destination: string) => {
    const target =
      destination === "..." ? path.slice(0, -1) : [...path, destination];

    const response = await UserService.loadDirectory(target);

    const duplicates = response
      .filter((file) => filenames.includes(file.name))
      .map((file) => file.name);

    if (duplicates.length > 0) {
      modalService.overwriteFiles(duplicates, async () => {
        try {
          await moveFiles(filenames, destination);
          modalService.closeModal();
        } catch (error: unknown) {
          if (error instanceof AxiosError && error.response?.status === 400)
            modalService.showError(error.response?.data.message);
          else {
            modalService.closeModal();
            throw error;
          }
        }
      });
    } else moveFiles(filenames, destination);
  };

  const modalRenameFile = async (filename: string) => {
    modalService.renameFile(filename, async (input?: string) => {
      try {
        if (input) await renameFile(filename, input);
        modalService.closeModal();
      } catch (error: unknown) {
        if (!(error instanceof AxiosError) || error.response?.status !== 400)
          modalService.closeModal();
        throw error;
      }
    });
  };

  const modalDeleteFile = async (filename: string) => {
    modalService.deleteFile(async () => {
      try {
        await deleteFile(filename);
        modalService.closeModal();
      } catch (error: unknown) {
        modalService.closeModal();
        throw error;
      }
    });
  };

  const modalDeleteSelectedFiles = async () => {
    const selectedFilenames: string[] = selected
      .map((id) => getNameById(id))
      .filter((name): name is string => typeof name === "string");

    modalService.deleteMultipleFiles(async () => {
      try {
        await deleteFiles(selectedFilenames);
        modalService.closeModal();
      } catch (error: unknown) {
        modalService.closeModal();
        throw error;
      }
    });
  };

  useEffect(() => {
    pathRef.current = path;
  }, [path]);

  useEffect(() => {
    setSelected([]);
    getFiles();
  }, [getFiles]);

  return (
    <div className="storage">
      <input
        className="upload-input"
        ref={uploadInput}
        type="file"
        onChange={modalUploadFiles}
        multiple
      />

      <div className="menu-bar">
        {selected.length === 0 ? (
          <IconContext.Provider value={{ className: "icon", size: "40" }}>
            <div className="icon-wrapper">
              <RxCheck onClick={selectAll} size="40" />
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
              <RxCross2 onClick={() => setSelected([])} />
              <span className="icon-tooltip">Cancel selection</span>
            </div>
            <div className="icon-wrapper">
              <FiDownload onClick={downloadSelected} />
              <span className="icon-tooltip">Download files</span>
            </div>
            <div className="icon-wrapper">
              <FiTrash2 onClick={modalDeleteSelectedFiles} />
              <span className="icon-tooltip">Delete files</span>
            </div>
          </IconContext.Provider>
        )}
      </div>

      <div className="files">
        {!inRoot && (
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
            disabled={processed.some(
              ([filename, filepath]) =>
                filename === file.name && filepath.join("/") === path.join("/")
            )}
            selected={selected.includes(file.id)}
            dragged={dragged === file.name}
            select={() =>
              selected.includes(file.id)
                ? unselectFile(file.id)
                : selectFile(file.id)
            }
            {...(file.type === "directory" && {
              goto: () => gotoDirectory(file.name),
            })}
            onContexMenu={(e) => openContexMenu(e, file.name)}
            onDragStart={(e) => handleDragStart(e, file.name)}
            onDrop={modalMoveFiles}
          />
        ))}

        {processed
          .filter(([_, filepath]) => filepath.join("/") === path.join("/"))
          .map(([filename, _]) => filename)
          .filter((name) => !files.map((file) => file.name).includes(name))
          .map((filename) => (
            <FileComponent
              key={crypto.randomUUID?.()}
              name={filename}
              type={"file"}
              lastModified={-1}
              size={-1}
              disabled={true}
            />
          ))}
      </div>

      {contextState.active && (
        <FileContextMenu
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
