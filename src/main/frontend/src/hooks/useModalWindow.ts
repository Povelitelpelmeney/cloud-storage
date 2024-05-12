import { useReducer } from "react";

enum ModalType {
  Error = "error",
  Overwrite = "overwrite",
  Delete = "delete",
  DeleteSelected = "delete_selected",
  CreateDirectory = "create_directory",
  Rename = "rename",
}

type CallbackType = (input?: string) => Promise<void>;

type ModalStateType = {
  show: boolean;
  type?: ModalType;
  title?: string;
  list?: string[];
  defaultValue?: string;
  message?: string;
  callback?: CallbackType;
};

type ActionType = {
  type: ModalType | "close";
  list?: string[];
  defaultValue?: string;
  message?: string;
  callback?: CallbackType;
};

const initialState: ModalStateType = {
  show: false,
};

const reducer = (state: ModalStateType, action: ActionType) => {
  switch (action.type) {
    case ModalType.Error:
      return {
        ...state,
        show: true,
        type: action.type,
        title: "Error",
        message: action.message,
      };
    case ModalType.Overwrite:
      return {
        ...state,
        show: true,
        type: action.type,
        title: "Overwrite",
        list: action.list,
        message:
          "Following files already exist in the target directory. Overwrite them?",
        callback: action.callback,
      };
    case ModalType.Delete:
      return {
        ...state,
        show: true,
        type: action.type,
        title: "Delete file",
        message: "Are you sure you want to delete this file?",
        callback: action.callback,
      };
    case ModalType.DeleteSelected:
      return {
        ...state,
        show: true,
        type: action.type,
        title: "Delete selected files",
        message: "Are you sure you want to delete these files?",
        callback: action.callback,
      };
    case ModalType.CreateDirectory:
      return {
        ...state,
        show: true,
        type: action.type,
        title: "Create directory",
        defaultValue: "",
        callback: action.callback,
      };
    case ModalType.Rename:
      return {
        ...state,
        show: true,
        type: action.type,
        title: "Rename",
        defaultValue: action.defaultValue,
        callback: action.callback,
      };
    case "close":
      return initialState;
    default:
      return state;
  }
};

const useModalWindow = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const showError = (message: string) => {
    dispatch({ type: ModalType.Error, message });
  };

  const overwriteFiles = (list: string[], callback: CallbackType) => {
    dispatch({ type: ModalType.Overwrite, list, callback });
  };

  const deleteFile = (callback: CallbackType) => {
    dispatch({ type: ModalType.Delete, callback });
  };

  const deleteSelectedFiles = (callback: CallbackType) => {
    dispatch({ type: ModalType.DeleteSelected, callback });
  };

  const createDirectory = (callback: CallbackType) => {
    dispatch({ type: ModalType.CreateDirectory, callback });
  };

  const renameFile = (defaultValue: string, callback: CallbackType) => {
    dispatch({ type: ModalType.Rename, defaultValue, callback });
  };

  const closeModal = () => {
    dispatch({ type: "close" });
  };

  return {
    state,
    service: {
      showError,
      overwriteFiles,
      deleteFile,
      deleteSelectedFiles,
      createDirectory,
      renameFile,
      closeModal,
    },
  } as const;
};

export { ModalType };
export { type ModalStateType };
export default useModalWindow;
