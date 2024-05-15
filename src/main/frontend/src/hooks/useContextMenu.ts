import { useEffect, useReducer } from "react";
import eventBus from "../common/eventBus";

type Point = {
  x: number;
  y: number;
};

type ContextMenuStateType = {
  active: boolean;
  filename: string;
  point: Point;
};

type SetActiveStateAction = {
  type: "set_active_state";
  active: boolean;
};

type SetFilenameAction = {
  type: "set_filename";
  filename: string;
};

type SetPointAction = {
  type: "set_point";
  point: Point;
};

type ContextMenuActionType =
  | SetActiveStateAction
  | SetFilenameAction
  | SetPointAction;

const reducer = (
  state: ContextMenuStateType,
  action: ContextMenuActionType
) => {
  switch (action.type) {
    case "set_active_state": {
      return { ...state, active: action.active };
    }
    case "set_filename": {
      return { ...state, filename: action.filename };
    }
    case "set_point": {
      return { ...state, point: action.point };
    }
    default:
      return state;
  }
};

const initialState = {
  active: false,
  filename: "",
  point: {
    x: 0,
    y: 0,
  },
};

const useContextMenu = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setActiveState = (active: boolean) => {
    dispatch({ type: "set_active_state", active });
  };

  const setFilename = (filename: string) => {
    dispatch({ type: "set_filename", filename });
  };

  const setPoint = (point: Point) => {
    dispatch({ type: "set_point", point });
  };

  useEffect(() => {
    const handleClick = () => setActiveState(false);
    eventBus.on("click", handleClick);
    return () => {
      eventBus.remove("click", handleClick);
    };
  }, []);

  return { state, service: { setActiveState, setFilename, setPoint } } as const;
};

export default useContextMenu;
