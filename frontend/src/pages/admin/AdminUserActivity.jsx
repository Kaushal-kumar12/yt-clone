import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../../styles/admin.css";

export default function AdminUserActivity() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [history, setHistory] = useState([]);
  const [likes, setLikes] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  const [open, setOpen] = useState(null); // history | likes | playlists
  const [openPlaylist, setOpenPlaylist] = useState(null);

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  /* ✅ FIX: memoized function */
  const loadActivity = useCallback(async () => {
    const res = await axios.get(
      `http://localhost:5000/api/admin/user/${id}/activity`,
      { headers }
    );

    setHistory(res.data.history);
    setLikes(res.data.likes);
    setPlaylists(res.data.playlists);
  }, [id, headers]);

  /* ✅ CLEAN useEffect */
  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  return (
    <div className="admin-page">
      <h2>User Activity</h2>

      {/* TOGGLE BUTTONS */}
      <div className="activity-buttons">
        <button onClick={() => setOpen(open === "history" ? null : "history")}>
          Watch History
        </button>

        <button onClick={() => setOpen(open === "likes" ? null : "likes")}>
          Liked Videos
        </button>

        <button onClick={() => setOpen(open === "playlists" ? null : "playlists")}>
          Playlists
        </button>
      </div>

      {/* WATCH HISTORY */}
      {open === "history" && (
        <div className="activity-section">
          {history.map((day) => (
            <div key={day._id}>
              <h4>{day._id}</h4>
              {day.videos.map((v) => (
                <p key={v._id}>{v.title}</p>
              ))}
            </div>
          ))}
          <button className="close-btn" onClick={() => setOpen(null)}>
            Close Watch History
          </button>
        </div>
      )}

      {/* LIKES */}
      {open === "likes" && (
        <div className="activity-section">
          {likes.map((l) => (
            <p key={l._id}>{l.video?.title}</p>
          ))}
          <button className="close-btn" onClick={() => setOpen(null)}>
            Close Liked Videos
          </button>
        </div>
      )}

      {/* PLAYLISTS */}
      {open === "playlists" && (
        <div className="activity-section">
          {playlists.map((p) => (
            <div key={p._id}>
              <h4
                onClick={() =>
                  setOpenPlaylist(openPlaylist === p._id ? null : p._id)
                }
              >
                {p.name} ({p.videos.length})
              </h4>

              {openPlaylist === p._id &&
                p.videos.map((v) => <p key={v._id}>{v.title}</p>)}
            </div>
          ))}
          <button className="close-btn" onClick={() => setOpen(null)}>
            Close Playlists
          </button>
        </div>
      )}
    </div>
  );
}
