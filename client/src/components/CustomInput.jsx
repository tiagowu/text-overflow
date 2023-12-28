import "../stylesheets/CustomInput.css";

const CustomInput = ({ id, name, label, hint, tag: Tag, placeholder, value, onChange, error, type = "text", rows, onKeyDown }) => {
  const inputProps = {
    id,
    name,
    type,
    placeholder,
    value,
    onChange,
    onKeyDown,
    autoComplete: "off",
    spellCheck: "false",
  };

  if (Tag === "textarea") {
    inputProps.rows = rows;
  }

  return (
    <div className="input-container">
      <label className="input-label">
        {label}
        {label && "*"}
        {hint && <p className="input-hint">{hint}</p>}
        <Tag {...inputProps} />
      </label>

      {error && (
        <p id={`${id}-error`} className="input-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default CustomInput;
