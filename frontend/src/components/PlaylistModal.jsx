import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/playlistModal.css";

export default function PlaylistModal({ videoId, onClose }) {
  const token = localStorage.getItem("token");

  const [playlists, setPlaylists] = useState([]);
  const [newName, setNewName] = useState("");
  const [loadingId, setLoadingId] = useState(null);

  /* =====================
     LOAD PLAYLISTS
  ===================== */
  useEffect(() => {
    axios
      .get("/playlists", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPlaylists(res.data))
      .catch(() => {});
  }, [token]);

  /* =====================
     TOGGLE VIDEO
  ===================== */
  const togglePlaylist = async (playlist) => {
    if (loadingId) return;
    setLoadingId(playlist._id);

    const hasVideo = playlist.videos.includes(videoId);

    try {
      if (hasVideo) {
        // REMOVE
        await axios.post(
          `/playlists/${playlist._id}/remove`,
          { videoId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // ADD
        await axios.post(
          `/playlists/${playlist._id}/add`,
          { videoId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // update UI instantly
      setPlaylists((prev) =>
        prev.map((p) =>
          p._id === playlist._id
            ? {
                ...p,
                videos: hasVideo
                  ? p.videos.filter((v) => v !== videoId)
                  : [...p.videos, videoId],
              }
            : p
        )
      );
    } finally {
      setLoadingId(null);
    }
  };

  /* =====================
     CREATE PLAYLIST
  ===================== */
  const createPlaylist = async () => {
    if (!newName.trim()) return;

    const res = await axios.post(
      "/playlists",
      { name: newName, videoId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setPlaylists((prev) => [...prev, res.data]);
    setNewName("");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Save to playlist</h3>

        {playlists.map((p) => (
          <label key={p._id} className="playlist-item">
            <input
              type="checkbox"
              checked={p.videos.includes(videoId)}
              disabled={loadingId === p._id}
              onChange={() => togglePlaylist(p)}
            />
            📁 {p.name}
          </label>
        ))}

        <div className="new-playlist">
          <input
            placeholder="New playlist name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button onClick={createPlaylist}>Create</button>
        </div>
      </div>
    </div>
  );
}
