import { useCallback, useEffect, useState } from "react";
import { IconContext } from "react-icons";
import { FcFile } from "react-icons/fc";
import { FcFolder } from "react-icons/fc";
import useSingleAndDoubleClick from "../../hooks/useSingleAndDoubleClick";
import "./FileComponent.scss";

type FileComponentProps = {
  selected?: boolean;
  select?: () => void;
  goto?: () => void;
  onContexMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
} & FileType;

const FileComponent = (props: FileComponentProps) => {
  const [lastModified, setLastModified] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const { handleClick, handleDoubleClick } = useSingleAndDoubleClick(
    () => props.select && props.select(),
    () => props.goto && props.goto()
  );

  const parseDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  }, []);

  const parseSize = useCallback((size: number) => {
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

  useEffect(() => {
    setLastModified(props.name === "..." ? "" : parseDate(props.lastModified));
    setSize(props.type === "directory" ? "" : parseSize(props.size));
  }, [props, parseDate, parseSize]);

  return (
    <div
      className={`file ${props.selected ? "selected" : ""}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      {...(props.onContexMenu && { onContextMenu: props.onContexMenu })}
    >
      <IconContext.Provider value={{ className: "file-icon", size: "40" }}>
        {props.type === "directory" ? <FcFolder /> : <FcFile />}
      </IconContext.Provider>
      <div className="filename">{props.name}</div>
      <div className="file-last-modified">{lastModified}</div>
      <div className="file-size">{size}</div>
    </div>
  );
};

export default FileComponent;
