import { useReducer } from "react";

type ModalStateType = {
  show: boolean;
  title: string;
  message: string;
  list?: string[];
  input?: boolean;
  selection?: boolean;
  callback?: () => void;
};

type ModalActionType = {
  type: string;
  payload: {
    list?: string[];
    input?: boolean;
    selection?: boolean;
    callback?: () => void;
  };
};

const initialState = {
  show: true,
  title: "",
  message: "",
};

const reducer = (
  state: ModalStateType,
  action: ModalActionType
): ModalStateType => {
  switch (action.type) {
    case "overwrite":
      return {
        show: true,
        title: "Overwrite",
        message: `Target directory has files with the same name.\n
          Are you sure you want to overwrite them?`,
        list: action.payload.list,
        input: false,
        selection: false,
        callback: action.payload.callback,
      };
    case "delete":
      return {
        show: true,
        title: "Delete",
        message: `Are you sure you want to delete these files?`,
        list: action.payload.list,
        input: false,
        selection: false,
        callback: action.payload.callback,
      };
    case "mkdir":
      return {
        show: true,
        title: "Create a directory",
        message: `Type a name for a directory`,
        list: undefined,
        input: true,
        selection: false,
        callback: action.payload.callback,
      };
    case "rename":
      return {
        show: true,
        title: "Rename",
        message: `Type a new name for a file`,
        list: undefined,
        input: true,
        selection: false,
        callback: action.payload.callback,
      };
    case "move":
      return {
        show: true,
        title: "Move",
        message: `Select a directory to which you want to move a file`,
        list: action.payload.list,
        input: false,
        selection: true,
        callback: action.payload.callback,
      };
    case "close":
      return initialState;
    default:
      return state;
  }
};

const useModalWindow = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const overwriteFiles = (list: string[], callback: () => void) => {
    dispatch({ type: "overwrite", payload: { list, callback } });
  };

  const deleteFiles = (list: string[], callback: () => void) => {
    dispatch({ type: "delete", payload: { list, callback } });
  };

  const createDirectory = (callback: () => void) => {
    dispatch({ type: "mkdir", payload: { callback } });
  };

  const renameFile = (callback: () => void) => {
    dispatch({ type: "rename", payload: { callback } });
  };

  const moveFile = (list: string[], callback: () => void) => {
    dispatch({ type: "move", payload: { list, callback } });
  };

  const closeModal = () => {
    dispatch({ type: "close", payload: {} });
  };

  return {
    state,
    service: {
      overwriteFiles,
      deleteFiles,
      createDirectory,
      renameFile,
      moveFile,
      closeModal,
    },
  };
};

export default useModalWindow;
