import { ModalStateType } from "../../hooks/useModalWindow";
import "./ModalWindow.scss";

type ModalWindowProps = {
  state: ModalStateType;
  onClose: () => void;
};

const ModalWindow = (props: ModalWindowProps) => {
  // const parseAction = () => {
  //   switch (props.state.action) {
  //     case: ""
  //   }
  // }

  return (
    <>
      <div className="overlay"></div>
      <div className="modal-window">
        <button className="modal-button close" onClick={props.onClose}>
          &times;
        </button>
        <div className="modal-message">{props.state.message}</div>
        <button className="modal-button confirm" onClick={() => props.state.callback("кеша")}>
          {props.state.action.charAt(0).toLocaleUpperCase() +
            props.state.action.slice(1)}
        </button>
      </div>
    </>
  );
};

export default ModalWindow;
