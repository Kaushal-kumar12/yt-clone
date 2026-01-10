import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function History() {
  const [history, setHistory] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/activity/history", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setHistory(res.data))
      .catch(err => console.error(err));
  }, [token]);

  /* ==========================
     GROUP HISTORY BY DATE
  ========================== */
  const groupedHistory = history.reduce((acc, item) => {
    const date = new Date(item.createdAt).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  const getDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return dateStr;
  };

  return (
    <div style={{ padding: "24px", flex: 1 }}>
      <h2>Watch History</h2>

      {history.length === 0 && (
        <p style={{ marginTop: 16 }}>No watch history yet</p>
      )}

      {Object.keys(groupedHistory).map(date => (
        <div key={date} style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 12 }}>
            {getDateLabel(date)}
          </h3>

          {groupedHistory[date].map(item => {
  if (!item.video) return null; // ✅ SAFETY

  return (
    <div
      key={item._id}
      style={styles.row}
      onClick={() => navigate(`/watch/${item.video._id}`)}
    >
      <img
        src={`https://img.youtube.com/vi/${item.video.youtubeId}/mqdefault.jpg`}
        alt={item.video.title}
        style={styles.thumb}
      />

      <div>
        <p style={styles.title}>{item.video.title}</p>
        <small style={styles.time}>
          Watched at {new Date(item.createdAt).toLocaleTimeString()}
        </small>
      </div>
    </div>
  );
})}

        </div>
      ))}
    </div>
  );
}

const styles = {
  row: {
    display: "flex",
    gap: 12,
    cursor: "pointer",
    marginBottom: 12,
  },
  thumb: {
    width: 160,
    borderRadius: 8,
  },
  title: {
    fontWeight: 500,
    marginBottom: 4,
  },
  time: {
    color: "#666",
  },
};
