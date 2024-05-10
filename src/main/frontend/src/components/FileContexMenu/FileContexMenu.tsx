import "./FileContexMenu.scss";

type FileContexMenuProps = {
  filename: string;
  top: number;
  left: number;
  delete: (filename: string) => void;
};

const FileContexMenu = (props: FileContexMenuProps) => {
  return (
    <div className="context-menu" style={{ top: props.top, left: props.left }}>
      <div className="context-menu-item first-item" onClick={() => console.log("download")}>
        Download
      </div>
      <div className="context-menu-item" onClick={() => console.log("rename")}>
        Rename
      </div>
      <div
        className="context-menu-item last-item"
        onClick={() => props.delete(props.filename)}
      >
        Delete
      </div>
    </div>
  );
};

export default FileContexMenu;
