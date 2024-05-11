import { Modal } from "react-bootstrap";
import { ModalStateType } from "../../hooks/useModalWindow";
import "./ModalWindow.scss";

type ModalWindowProps = {
  state: ModalStateType;
};

const ModalWindow = (props: ModalWindowProps) => {
  // const parseAction = () => {
  //   switch (props.state.action) {
  //     case: ""
  //   }
  // }

  return (
    <Modal show={props.state.type !== "hidden"} centered>
      <Modal.Header closeButton>
        <Modal.Title>Title</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h1>Hi</h1>
      </Modal.Body>
    </Modal>
  );
};

export default ModalWindow;
