import { useEffect, useState } from "react";
import eventBus from "../common/eventBus";

type Point = {
  x: number;
  y: number;
};

const useContextMenu = () => {
  const [filename, setFilename] = useState<string>("");
  const [clicked, setClicked] = useState<boolean>(false);
  const [point, setPoint] = useState<Point>({ x: 0, y: 0 });

  useEffect(() => {
    const handleClick = () => setClicked(false);
    eventBus.on("click", handleClick);
    return () => {
      eventBus.remove("click", handleClick);
    };
  }, []);

  return { filename, setFilename, clicked, setClicked, point, setPoint };
};

export default useContextMenu;
