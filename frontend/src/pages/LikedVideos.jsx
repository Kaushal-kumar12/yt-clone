import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ThreeDotMenu from "../components/ThreeDotMenu";

export default function LikedVideos() {
  const [likes, setLikes] = useState([]);
  const [blocked, setBlocked] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  /* =========================
     LOAD LIKES
  ========================= */
  const loadLikes = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/likes",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const safeLikes = (res.data || []).filter(l => l.video);
      setLikes(safeLikes);
      setBlocked(false);
    } catch (err) {
      if (err.response?.status === 403) {
        setBlocked(true);
      } else {
        console.error(err);
      }
    }
  }, [token]);

  useEffect(() => {
    loadLikes();
  }, [loadLikes]);

  /* =========================
     REMOVE LIKE
  ========================= */
  const removeLike = async (videoId) => {
    await axios.post(
      "http://localhost:5000/api/likes",
      { videoId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    loadLikes();
  };

  /* =========================
     BLOCKED UI
  ========================= */
  if (blocked) {
    return (
      <div style={styles.blockedBox}>
        <h2>Account Restricted</h2>
        <p>Your account is blocked. You cannot view liked videos.</p>
      </div>
    );
  }

  /* =========================
     GROUP BY DATE
  ========================= */
  const grouped = likes.reduce((acc, like) => {
    const date = like.createdAt
      ? new Date(like.createdAt).toDateString()
      : "Liked";

    acc[date] = acc[date] || [];
    acc[date].push(like);
    return acc;
  }, {});

  /* =========================
     UI
  ========================= */
  return (
    <div style={{ padding: 24 }}>
      <h2>Liked Videos</h2>

      {likes.length === 0 && (
        <p style={{ marginTop: 16 }}>No liked videos yet</p>
      )}

      {Object.keys(grouped).map((date) => (
        <div key={date}>
          <h4 style={{ marginTop: 20 }}>{date}</h4>

          {grouped[date].map((like) => (
            <div
              key={like._id}
              style={styles.row}
              onClick={() => navigate(`/watch/${like.video._id}`)}
            >
              <img
                src={`https://img.youtube.com/vi/${like.video.youtubeId}/mqdefault.jpg`}
                alt={like.video.title}
                width="160"
                style={{ borderRadius: 8 }}
              />

              <p style={{ flex: 1 }}>{like.video.title}</p>

              {/* ✅ Three-dot menu (LIKE MODE) */}
              <div onClick={(e) => e.stopPropagation()}>
                <ThreeDotMenu
                  mode="like"
                  onView={() => navigate(`/watch/${like.video._id}`)}
                  onRemove={() => removeLike(like.video._id)}
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const styles = {
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    cursor: "pointer",
  },
  blockedBox: {
    padding: 40,
    textAlign: "center",
    color: "#c53030",
  },
};
