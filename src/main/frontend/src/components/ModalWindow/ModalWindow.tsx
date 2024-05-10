import "./ModalWindow.scss";
import useModal from "../../hooks/useModal";

type ModalWindowType = {
  active: boolean;
  setActive: () => void;
  type: string;
  // message: string;
};
const ModalWindow = (props: ModalWindowType) => {
  return (
    <>
      <div className={`overlay ${props.active && "active"}`}></div>
      <div className={`modal-window ${props.active && "active"}`}>
        <div className="modal-content">
          <button
            className="close-modal-button"
            onClick={() => props.setActive()}
          >
            &times;
            {/* <h2>{props.message}</h2> */}
          </button>
        </div>
      </div>
    </>
  );
};
export default ModalWindow;
