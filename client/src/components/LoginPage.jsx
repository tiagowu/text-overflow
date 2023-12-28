import { useState } from "react";
import { useError } from "../context/ErrorContext";

import userService from "../services/userService";
import validateEmail from "../utils/validateEmail";

import CustomInput from "./CustomInput";

import "../stylesheets/LoginPage.css";

const LoginPage = ({ onUserChange, onContentChange }) => {
  const { setError } = useError();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({
    emailError: "",
    passwordError: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formData;
    const newFormErrors = {
      emailError: "",
      passwordError: "",
    };

    if (!email) {
      newFormErrors.emailError = "The email field cannot be left empty.";
    } else if (!validateEmail(email)) {
      newFormErrors.emailError = "The email appears to be ill-formed.";
    }

    if (!password) {
      newFormErrors.passwordError = "The password field cannot be left empty.";
    }

    setFormErrors(newFormErrors);

    if (!newFormErrors.emailError && !newFormErrors.passwordError) {
      try {
        const newUserData = {
          email,
          password,
        };
        const data = await userService.login(newUserData);
        onUserChange(data.user);
        onContentChange({ text: "all-questions" });
      } catch (err) {
        setError(err);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Login</h2>
        <form className="login-form" onSubmit={(e) => handleSubmit(e)}>
          <CustomInput
            id="login-email"
            name="email"
            label="Email"
            tag="input"
            value={formData.email}
            onChange={handleInputChange}
            error={formErrors.emailError}
          />
          <CustomInput
            id="login-password"
            name="password"
            label="Password"
            tag="input"
            value={formData.password}
            onChange={handleInputChange}
            error={formErrors.passwordError}
            type="password"
          />
          <div className="login-form-button">
            <button type="submit">Login</button>
          </div>
        </form>
        <div className="login-page-bottom">
          <div className="login-action">
            <p>Don't have an account?</p>
            <button onClick={() => onContentChange({ text: "sign-up" })}>Sign Up</button>
          </div>
          <button onClick={() => onContentChange({ text: "welcome" })}>Return to Welcome Page</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
