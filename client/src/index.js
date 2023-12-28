import React from "react";
import ReactDOM from "react-dom/client";

import { ErrorProvider } from "./context/ErrorContext";
import ErrorAlert from "./components/ErrorAlert";
import App from "./App.js";

import "./stylesheets/index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ErrorProvider>
    <App />
    <ErrorAlert />
  </ErrorProvider>
);
