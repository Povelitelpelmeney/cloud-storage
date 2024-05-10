import { useState } from "react";

const useModal = () => {
  const [isShowing, setIsShowing] = useState<boolean>(false);
  const toggle = () => {
    setIsShowing(!isShowing);
  };
  console.log(isShowing);
  return { isShowing, toggle };
};

export default useModal;
