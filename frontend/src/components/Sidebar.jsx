import { Link, useNavigate } from "react-router-dom";

const Sidebar = ({ open, isMobile, onClose }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!open) return null;

  return (
    <div
      className="sidebar"
      style={{
        position: isMobile ? "fixed" : "relative",
        zIndex: 2000,
      }}
    >
      {isMobile && user && (
        <>
          <p className="sidebar-user">Hi, {user.name}</p>
          <button
            className="sidebar-logout"
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </>
      )}

      <Link to="/" onClick={onClose}>🏠 Home</Link>
      <Link to="/history" onClick={onClose}>🕘 History</Link>
      <Link to="/liked" onClick={onClose}>👍 Liked</Link>
      <Link to="/playlists" onClick={onClose}>🎵 Playlists</Link>
    </div>
  );
};

export default Sidebar;
