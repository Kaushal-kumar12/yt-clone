import { useNavigate } from "react-router-dom";
import { useState } from "react";



const Navbar = ({ toggleSidebar, isMobile, hideToggle }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div style={styles.nav}>
      {/* LEFT */}
      <div style={styles.left}>
        {!hideToggle && (
          <button onClick={toggleSidebar} style={styles.menu}>
            ☰
          </button>
        )}

        <h2 style={styles.logo} onClick={() => navigate("/")}>
          YouTube Clone
        </h2>
      </div>

      {/* SEARCH */}
      <input
        style={styles.search}
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const q = search.trim();
            if (!q) return;
            navigate(`/search?q=${encodeURIComponent(q)}`);
          }
        }}
      />

      {/* RIGHT */}
      <div style={styles.right}>
        {/* ADMIN */}
        {user?.role === "admin" && (
          <button onClick={() => navigate("/admin")}>Admin</button>
        )}

        {/* LOGGED IN (DESKTOP) */}
        {!isMobile && user && (
          <>
            <span>Hi, {user.name}</span>
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
            >
              Logout
            </button>
          </>
        )}

        {/* NOT LOGGED IN */}
        {!user && (
          <>
            <button onClick={() => navigate("/login")}>Login</button>
            <button onClick={() => navigate("/register")}>Register</button>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid #e5e5e5",
    background: "#fff",
    position: "sticky",
    top: 0,
    zIndex: 2000,
  },
  left: { display: "flex", gap: 12, alignItems: "center" },
  menu: { fontSize: 22, background: "transparent", cursor: "pointer" },
  logo: { cursor: "pointer" },
  search: {
    width: "40%",
    padding: "8px 14px",
    borderRadius: 20,
    border: "1px solid #ccc",
  },
  right: { display: "flex", gap: 12, alignItems: "center" },
};

export default Navbar;
