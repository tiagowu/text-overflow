import { useEffect } from "react";
import { useError } from "../context/ErrorContext";

import "../stylesheets/ErrorAlert.css";

const ErrorAlert = () => {
  const { error, clearError } = useError();

  useEffect(() => {
    const timerId = setTimeout(() => {
      clearError();
    }, 8000);

    return () => clearTimeout(timerId);
  }, [error, clearError]);

  return (
    <div className={`error-alert ${error ? "visible" : ""}`}>
      {error && (
        <div className="error-content">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default ErrorAlert;
