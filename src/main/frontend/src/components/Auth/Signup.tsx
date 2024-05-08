import { useState, useCallback } from "react";
import { NavLink, NavigateFunction, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { Button, Container, Form, FormGroup } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import AuthService from "../../services/auth-service";
import "./Auth.scss";

const Signup = () => {
  const navigate: NavigateFunction = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
    },
    validationSchema: Yup.object().shape({
      username: Yup.string()
        .test(
          "len",
          "The username must be between 3 and 20 characters",
          (value: string | undefined) =>
            typeof value === "string" && value.length >= 3 && value.length <= 20
        )
        .required("This field is required!"),
      email: Yup.string()
        .email("This is not a valid email")
        .required("This field is required!"),
      password: Yup.string()
        .test(
          "len",
          "The password must be between 6 and 40 characters",
          (value: string | undefined) =>
            typeof value === "string" && value.length >= 6 && value.length <= 40
        )
        .required("This field is required!"),
    }),
    onSubmit: (values) => {
      setMessage("");
      handleSignup(values).catch((error: AxiosError<APIError>) => {
        if (error.response?.status === 409)
          setMessage(error.response.data.message);
        setLoading(false);
      });
    },
  });

  const handleSignup = useCallback(
    async (values: SignupRequest) => {
      setLoading(true);
      await AuthService.signup(values);
      setLoading(false);
      navigate("/login");
    },
    [navigate]
  );

  return (
    <Container className="card signup-card">
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

        <FormGroup controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            name="email"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
          <Form.Text className="text-danger">
            {formik.touched.email && formik.errors.email ? (
              <div className="text-danger">{formik.errors.email}</div>
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
          Sign up&nbsp;
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

export default Signup;
