import { useState, useCallback } from "react";
import { NavLink, NavigateFunction, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { Button, Container, Form, FormGroup } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import AuthService from "../../services/auth-service";
import "./Auth.scss";

const Login = () => {
  const navigate: NavigateFunction = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: Yup.object().shape({
      username: Yup.string().required("This field is required!"),
      password: Yup.string().required("This field is required!"),
    }),
    onSubmit: async (values) => {
      try {
        setMessage("");
        setLoading(true);
        await handleLogin(values);
        setLoading(false);
      } catch (error: unknown) {
        if (error instanceof AxiosError && error.response?.status === 401)
          setMessage("Incorrect username or password");
        setLoading(false);
      }
    },
  });

  const handleLogin = useCallback(
    async (values: LoginRequest) => {
      await AuthService.login(values);
      navigate("/");
      window.location.reload();
    },
    [navigate]
  );

  return (
    <Container className="card login-card">
      <NavLink to="/" className="nav-link">
        <button className="close-modal-button">&times;</button>
      </NavLink>
      <Form onSubmit={formik.handleSubmit}>
        <FormGroup controlId="username">
          <Form.Label>Username</Form.Label>
          <Form.Control
            name="username"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.username}
          />
          <Form.Text className="text-danger">
            {formik.touched.username && formik.errors.username ? (
              <div className="text-danger">{formik.errors.username}</div>
            ) : null}
          </Form.Text>
        </FormGroup>

        <FormGroup controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            name="password"
            type="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
          />
          <Form.Text className="text-danger">
            {formik.touched.password && formik.errors.password ? (
              <div className="text-danger">{formik.errors.password}</div>
            ) : null}
          </Form.Text>
        </FormGroup>

        <Button className="submit-button" variant="primary" type="submit">
          Login&nbsp;
          {loading && (
            <span className="spinner-border spinner-border-sm"></span>
          )}
        </Button>

        {message && (
          <FormGroup className="error-message">
            <Form.Text className="alert alert-danger">{message}</Form.Text>
          </FormGroup>
        )}
      </Form>
    </Container>
  );
};

export default Login;
