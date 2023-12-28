import "../stylesheets/MainMenu.css";

const MainMenu = ({ user, currentContent, onContentChange }) => {
  const menuItems = ["Questions", "Tags"];

  return (
    <div className="main-menu">
      <ul className="menu-list">
        {menuItems.map((menuItem) => (
          <li
            key={menuItem.toLowerCase() + "-menu-item"}
            className={`menu-item 
            ${menuItem === "Questions" && currentContent.text.includes("questions") ? "active-menu-item" : ""}
            ${menuItem === "Tags" && currentContent.text.includes("tags") ? "active-menu-item" : ""}`}
            onClick={() => {
              if (currentContent.text !== "error") onContentChange({ text: `all-${menuItem.toLowerCase()}` });
            }}
          >
            {menuItem}
          </li>
        ))}
      </ul>

      <div className="menu-actions">
        {user ? (
          <>
            <p className="menu-user">
              {user.username} ({user.reputation})
            </p>
            <button onClick={() => onContentChange({ text: "user-profile" })}>View Profile</button>
          </>
        ) : (
          <>
            <button onClick={() => onContentChange({ text: "sign-up" })}>Sign Up</button>
            <button onClick={() => onContentChange({ text: "login" })}>Login</button>
          </>
        )}
      </div>
    </div>
  );
};

export default MainMenu;
