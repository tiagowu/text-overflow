import { useState } from "react";
import { useError } from "../context/ErrorContext";

import userService from "../services/userService";
import validateEmail from "../utils/validateEmail";

import CustomInput from "./CustomInput";

import "../stylesheets/SignUpPage.css";

const SignUpPage = ({ onContentChange }) => {
  const { setError } = useError();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState({
    usernameError: "",
    emailError: "",
    passwordError: "",
    confirmPasswordError: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, email, password, confirmPassword } = formData;
    const newFormErrors = {
      usernameError: "",
      emailError: "",
      passwordError: "",
      confirmPasswordError: "",
    };

    if (!username) {
      newFormErrors.usernameError = "The username field cannot be left empty.";
    }

    if (!email) {
      newFormErrors.emailError = "The email field cannot be left empty.";
    } else if (!validateEmail(email)) {
      newFormErrors.emailError = "The email appears to be ill-formed.";
    }

    if (!password) {
      newFormErrors.passwordError = "The password field cannot be left empty.";
    }

    if (!confirmPassword) {
      newFormErrors.confirmPasswordError = "The confirm password field cannot be left empty.";
    } else if (
      (!newFormErrors.usernameError && password.includes(username)) ||
      (!newFormErrors.emailError && password.includes(email.split("@")[0]))
    ) {
      newFormErrors.passwordError = "The password cannot contain your username or email.";
    }

    if (password && confirmPassword && password !== confirmPassword) {
      newFormErrors.passwordError = "The password does not match.";
      newFormErrors.confirmPasswordError = "The password does not match.";
    }

    setFormErrors(newFormErrors);

    if (!newFormErrors.usernameError && !newFormErrors.emailError && !newFormErrors.passwordError && !newFormErrors.confirmPasswordError) {
      try {
        const newUserData = {
          username,
          email,
          password,
        };
        await userService.signup(newUserData);
        onContentChange({ text: "login" });
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
    <div className="signup-page">
      <div className="signup-container">
        <h2>Sign Up</h2>
        <form className="signup-form" onSubmit={(e) => handleSubmit(e)}>
          <CustomInput
            id="signup-username"
            name="username"
            label="Username"
            tag="input"
            value={formData.username}
            onChange={handleInputChange}
            error={formErrors.usernameError}
          />
          <CustomInput
            id="signup-email"
            name="email"
            label="Email"
            tag="input"
            value={formData.email}
            onChange={handleInputChange}
            error={formErrors.emailError}
          />
          <CustomInput
            id="signup-password"
            name="password"
            label="Password"
            tag="input"
            value={formData.password}
            onChange={handleInputChange}
            error={formErrors.passwordError}
            type="password"
          />
          <CustomInput
            id="signup-confirm-password"
            name="confirmPassword"
            label="Confirm Password"
            tag="input"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={formErrors.confirmPasswordError}
            type="password"
          />
          <div className="signup-form-button">
            <button type="submit">Sign Up</button>
          </div>
        </form>
        <div className="signup-page-bottom">
          <div className="signup-action">
            <p>Already have an account?</p>
            <button onClick={() => onContentChange({ text: "login" })}>Login</button>
          </div>
          <button onClick={() => onContentChange({ text: "welcome" })}>Return to Welcome Page</button>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
