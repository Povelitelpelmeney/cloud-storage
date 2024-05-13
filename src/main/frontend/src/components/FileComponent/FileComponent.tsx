import { useCallback, useEffect, useState } from "react";
import { IconContext } from "react-icons";
import { FcFile } from "react-icons/fc";
import { FcFolder } from "react-icons/fc";
import "./FileComponent.scss";

type FileComponentProps = {
  disabled: boolean;
  selected?: boolean;
  dragged?: boolean;
  select?: () => void;
  goto?: () => void;
  onContexMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (filenames: string[], targetDir: string) => Promise<void>;
} & TypeDiff<FileType, { id: string }>;

const FileComponent = (props: FileComponentProps) => {
  const [lastModified, setLastModified] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [dragOver, setDragOver] = useState<boolean>(false);

  const parseDate = useCallback((timestamp: number) => {
    if (timestamp === -1) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  }, []);

  const parseSize = useCallback((size: number) => {
    if (size === -1) return "";

    const sizes = ["B", "KB", "MB", "GB", "TB"];
    let counter = 0;

    while (size > 1000) {
      size /= 1000;
      counter++;
    }

    return counter < sizes.length
      ? `${Math.round(size * 100) / 100} ${sizes[counter]}`
      : "Too much";
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = () => {
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    setDragOver(false);
    const filenames: string[] = JSON.parse(
      e.dataTransfer.getData("text/plain")
    )!;
    await props.onDrop!(filenames, props.name);
  };

  useEffect(() => {
    setLastModified(parseDate(props.lastModified));
    setSize(parseSize(props.size));
  }, [props, parseDate, parseSize]);

  return (
    <div
      className={`file${props.disabled ? " disabled" : ""}${
        !props.disabled && props.selected ? " selected" : ""
      }${!props.disabled && dragOver ? " drag-over" : ""}`}
      onClick={() => props.select && props.select()}
      onDoubleClick={() => props.goto && props.goto()}
      {...(props.onContexMenu && { onContextMenu: props.onContexMenu })}
    >
      {!props.disabled && (
        <div
          className="overlay"
          {...(props.onDragStart && {
            draggable: true,
            onDragStart: props.onDragStart,
          })}
          {...(!props.dragged &&
            !props.selected &&
            props.type === "directory" &&
            props.onDrop && {
              onDragOver: handleDragOver,
              onDragEnter: handleDragEnter,
              onDragLeave: handleDragLeave,
              onDrop: handleDrop,
            })}
        ></div>
      )}
      <IconContext.Provider value={{ className: "file-icon", size: "40" }}>
        {props.type === "file" ? <FcFile /> : <FcFolder />}
      </IconContext.Provider>
      <div className="filename">{props.name}</div>
      <div className="file-last-modified">{lastModified}</div>
      <div className="file-size">{size}</div>
    </div>
  );
};

export default FileComponent;
