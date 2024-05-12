import { useRef } from "react";
import { useDebouncedCallback } from "use-debounce";

const DELAY = 250;

const useSingleAndDoubleClick = (
  onClick: () => unknown,
  onDoubleClick: () => unknown
) => {
  const clicks = useRef(0);

  const callFunction = useDebouncedCallback(() => {
    clicks.current === 3 ? onDoubleClick() : onClick();
    clicks.current = 0;
  }, DELAY);

  const handleClick = () => {
    clicks.current++;
    callFunction();
  };

  const handleDoubleClick = () => {
    clicks.current++;
  };

  return { handleClick, handleDoubleClick };
};

export default useSingleAndDoubleClick;
