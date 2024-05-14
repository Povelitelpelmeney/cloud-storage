import { useReducer } from "react";

enum ModalType {
  Error = "error",
  Overwrite = "overwrite",
  Delete = "delete",
  Input = "input",
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
  title?: string;
  list?: string[];
  defaultValue?: string;
  message?: string;
  multiple?: boolean;
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
        message: `Are you sure you want to delete ${
          action.multiple ? "these files" : "this file"
        }?`,
        callback: action.callback,
      };
    case ModalType.Input:
      return {
        ...state,
        show: true,
        type: action.type,
        title: action.title,
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

  const deleteMultipleFiles = (callback: CallbackType) => {
    dispatch({ type: ModalType.Delete, multiple: true, callback });
  };

  const createDirectory = (callback: CallbackType) => {
    dispatch({
      type: ModalType.Input,
      title: "Create directory",
      defaultValue: "",
      callback,
    });
  };

  const renameFile = (defaultValue: string, callback: CallbackType) => {
    dispatch({
      type: ModalType.Input,
      title: "Rename",
      defaultValue,
      callback,
    });
  };

  const closeModal = () => {
    console.log(state);
    dispatch({ type: "close" });
    console.log(state);
  };

  return {
    state,
    service: {
      showError,
      overwriteFiles,
      deleteFile,
      deleteMultipleFiles,
      createDirectory,
      renameFile,
      closeModal,
    },
  } as const;
};

export { ModalType };
export { type ModalStateType };
export default useModalWindow;
