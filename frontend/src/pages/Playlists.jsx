import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [blocked, setBlocked] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://yt-clone-rust.vercel.app/api/playlists", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setPlaylists(res.data || []);
        setBlocked(false);
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          setBlocked(true); // 🚫 user blocked
        } else {
          console.error(err);
        }
      });
  }, [token]);

  /* ======================
     BLOCKED UI
  ====================== */
  if (blocked) {
    return (
      <div style={styles.blockedBox}>
        <h2>Account Restricted</h2>
        <p>Your account is blocked. You cannot access playlists.</p>
      </div>
    );
  }

  /* ======================
     NORMAL UI
  ====================== */
  return (
    <div style={{ padding: 20 }}>
      <h2>Your Playlists</h2>

      {playlists.length === 0 && (
        <p style={{ marginTop: 16 }}>No playlists created yet</p>
      )}

      {playlists.map((p) => (
        <div
          key={p._id}
          onClick={() => navigate(`/playlist/${p._id}`)}
          style={styles.playlistItem}
        >
          📁 {p.name} ({p.videos?.length || 0})
        </div>
      ))}
    </div>
  );
}

const styles = {
  playlistItem: {
    cursor: "pointer",
    marginBottom: 10,
    padding: "8px 12px",
    borderRadius: 6,
    background: "#f7f7f7",
  },
  blockedBox: {
    padding: 40,
    textAlign: "center",
    color: "#c53030",
  },
};
