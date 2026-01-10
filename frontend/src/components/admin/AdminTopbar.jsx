const AdminTopbar = () => {
  return (
    <div style={styles.topbar}>
      <h2>Admin Dashboard</h2>
    </div>
  );
};

const styles = {
  topbar: {
    height: "60px",
    background: "#fff",
    borderBottom: "1px solid #ddd",
    padding: "10px 20px",
    display: "flex",
    alignItems: "center",
  },
};

export default AdminTopbar;
