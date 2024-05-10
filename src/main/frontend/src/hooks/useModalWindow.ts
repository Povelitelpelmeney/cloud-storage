import { useReducer } from "react";

type ModalStateType = {
  type: string;
  action: string;
  message: string;
  error?: string;
  directories?: string[];
  callback?: (arg: FileType[] & FileType & string) => void;
};

type ConfirmationAction = {
  type: "overwrite" | "delete";
  message: string;
  callback: (files: FileType[]) => void;
};

type InputAction = {
  type: "rename" | "mkdir";
  message: string;
  callback: (filename: string, newFilename?: string) => void;
};

type SelectionAction = {
  type: "move";
  message: string;
  list: string[];
  callback: (file: FileType) => void;
};

type ErrorAction = {
  type: "error";
  message: string;
};

type CloseAction = {
  type: "close";
};

type ModalActionType =
  | ConfirmationAction
  | InputAction
  | SelectionAction
  | ErrorAction
  | CloseAction;

const initialState: ModalStateType = {
  type: "hidden",
  action: "",
  message: "",
};

const reducer = (state: ModalStateType, action: ModalActionType) => {
  switch (action.type) {
    case "overwrite":
    case "delete":
      return {
        ...state,
        type: "confirmation",
        action: action.type,
        message: action.message,
        error: undefined,
        callback: action.callback,
      };
    case "mkdir":
    case "rename":
      return {
        ...state,
        type: "input",
        action: action.type,
        message: action.message,
        error: undefined,
        callback: action.callback,
      };
    case "move":
      return {
        ...state,
        type: "selection",
        action: action.type,
        message: action.message,
        error: undefined,
        directories: action.list,
        callback: action.callback,
      };
    case "error":
      return { ...state, error: action.message };
    case "close":
      return initialState;
    default:
      return state;
  }
};

const useModalWindow = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const overwriteFiles = (
    message: string,
    callback: (files: FileType[]) => void
  ) => {
    dispatch({ type: "overwrite", message, callback });
  };

  const deleteFiles = (
    message: string,
    callback: (files: FileType[]) => void
  ) => {
    dispatch({ type: "delete", message, callback });
  };

  const makeDirectory = (
    message: string,
    callback: (filename: string) => void
  ) => {
    dispatch({ type: "mkdir", message, callback });
  };

  const renameFile = (
    message: string,
    callback: (filename: string, newFilename?: string) => void
  ) => {
    dispatch({ type: "rename", message, callback });
  };

  const moveFile = (
    message: string,
    directories: string[],
    callback: (file: FileType) => void
  ) => {
    dispatch({ type: "move", message, list: directories, callback });
  };

  const showError = (error: string) => {
    dispatch({ type: "error", message: error });
  };

  const closeModal = () => {
    dispatch({ type: "close" });
  };

  return {
    state,
    service: {
      overwriteFiles,
      deleteFiles,
      makeDirectory,
      renameFile,
      moveFile,
      showError,
      closeModal,
    },
  } as const;
};

export { type ModalStateType };
export default useModalWindow;
