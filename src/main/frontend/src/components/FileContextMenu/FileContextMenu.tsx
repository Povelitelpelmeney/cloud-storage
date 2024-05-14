import "./FileContextMenu.scss";

type FileContexMenuProps = {
  filename: string;
  top: number;
  left: number;
  download: (filename: string) => Promise<void>;
  rename: (filename: string) => Promise<void>;
  delete: (filename: string) => Promise<void>;
};

const FileContexMenu = (props: FileContexMenuProps) => {
  return (
    <div className="context-menu" style={{ top: props.top, left: props.left }}>
      <div
        className="context-menu-item"
        onClick={() => props.download(props.filename)}
      >
        Download
      </div>
      <div
        className="context-menu-item"
        onClick={() => props.rename(props.filename)}
      >
        Rename
      </div>
      <div
        className="context-menu-item"
        onClick={() => props.delete(props.filename)}
      >
        Delete
      </div>
    </div>
  );
};

export default FileContexMenu;
