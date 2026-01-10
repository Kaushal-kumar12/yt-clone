import { NavLink } from "react-router-dom";

const AdminSidebar = () => {
  return (
    <div style={styles.sidebar}>
      <h3 style={styles.title}>Admin Panel</h3>

      <NavLink to="/admin" style={styles.link}>Dashboard</NavLink>
      <NavLink to="/admin/users" style={styles.link}>Users</NavLink>
      <NavLink to="/admin/channels" style={styles.link}>Channels</NavLink>
      <NavLink to="/admin/upload" style={styles.link}>Upload Video</NavLink>
    </div>
  );
};

const styles = {
  sidebar: {
    width: "220px",
    minHeight: "100vh",
    background: "#111",
    color: "#fff",
    padding: "20px",
  },
  title: {
    marginBottom: "20px",
  },
  link: {
    display: "block",
    padding: "10px",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "6px",
    marginBottom: "6px",
    background: "#1f1f1f",
  },
};

export default AdminSidebar;
