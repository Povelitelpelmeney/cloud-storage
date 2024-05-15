import { useEffect, useState } from "react";
import { Button, Form, FormGroup, Modal } from "react-bootstrap";
import { AxiosError } from "axios";
import { ModalType, ModalStateType } from "../../hooks/useModalWindow";
import "./ModalWindow.scss";

type ModalWindowProps = {
  state: ModalStateType;
  onClose: () => void;
};

const infoTypes = [ModalType.Error, ModalType.Overwrite, ModalType.Delete];
const inputType = ModalType.Input;

const ModalWindow = (props: ModalWindowProps) => {
  const [input, setInput] = useState<string>(props.state.defaultValue || "");
  const [warning, setWarning] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setWarning("");
  };

  const handleSubmit = async () => {
    if (!props.state.type || !props.state.callback || loading) return;

    setLoading(true);

    try {
      if (infoTypes.includes(props.state.type)) await props.state.callback();
      else if (inputType === props.state.type)
        await props.state.callback(input);
      setLoading(false);
    } catch (error: unknown) {
      setLoading(false);
      if (error instanceof AxiosError && error.response?.status === 400) {
        setWarning(error.response?.data.message.split(/: /)[1]);
      } else throw error;
    }
  };

  useEffect(() => setWarning(""), [props.state.show]);

  return (
    <Modal
      className="modal-window"
      show={props.state.show}
      onHide={props.onClose}
    >
      {props.state.type && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>{props.state.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {props.state.type === ModalType.Error && (
              <p className="alert alert-danger text">{props.state.message}</p>
            )}

            {props.state.type === ModalType.Overwrite && props.state.list && (
              <>
                <p className="text">{props.state.message}</p>
                <ul className="list">
                  {props.state.list.map((name) => (
                    <li className="list-item" key={name}>
                      {name}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {props.state.type === ModalType.Delete && (
              <p className="text">{props.state.message}</p>
            )}

            {props.state.type === ModalType.Input && (
              <Form onSubmit={(e) => e.preventDefault()}>
                <FormGroup>
                  <Form.Control
                    className="input-field"
                    type="text"
                    defaultValue={props.state.defaultValue}
                    onChange={handleChange}
                    autoFocus
                  />
                </FormGroup>

                <Form.Text className="text-danger">
                  {warning.length > 0 && (
                    <div className="text-danger">{warning}</div>
                  )}
                </Form.Text>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={props.onClose}>
              Close
            </Button>
            {props.state.type !== ModalType.Error && (
              <Button variant="primary" onClick={handleSubmit}>
                Confirm
                {loading && (
                  <span className="spinner-border spinner-border-sm"></span>
                )}
              </Button>
            )}
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};

export default ModalWindow;
