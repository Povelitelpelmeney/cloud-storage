type FileContexMenuProps = {
  filename: string;
  upload: (filename: string) => void;
  rename: (filename: string) => void;
  delete: (filename: string) => void;
};

const FileContexMenu = (props: FileContexMenuProps) => {
  return (
    <ul className="context-menu">
      <li
        className="context-menu-item"
        onClick={() => props.upload(props.filename)}
      >
        Upload
      </li>
      <li
        className="context-menu-item"
        onClick={() => props.rename(props.filename)}
      >
        Rename
      </li>
      <li
        className="context-menu-item"
        onClick={() => props.rename(props.filename)}
      >
        Delete
      </li>
    </ul>
  );
};

export default FileContexMenu;
