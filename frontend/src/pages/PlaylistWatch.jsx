import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import ThreeDotMenu from "../components/ThreeDotMenu";

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [playlist, setPlaylist] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { id } = useParams(); // playlist id (if opened)

  /* =========================
     LOAD ALL PLAYLISTS
  ========================= */
  const loadPlaylists = useCallback(async () => {
    const res = await axios.get("https://yt-clone-rust.vercel.app/api/playlists", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPlaylists(res.data);
  }, [token]);

  /* =========================
     LOAD SINGLE PLAYLIST
  ========================= */
  const loadPlaylist = useCallback(async () => {
    if (!id) return;

    const res = await axios.get(
      `https://yt-clone-rust.vercel.app/api/playlists/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setPlaylist(res.data);
  }, [id, token]);

  useEffect(() => {
    if (id) {
      loadPlaylist();
    } else {
      loadPlaylists();
    }
  }, [id, loadPlaylists, loadPlaylist]);

  /* =========================
     REMOVE FROM PLAYLIST
  ========================= */
  const removeFromPlaylist = async (videoId) => {
    await axios.post(
      "https://yt-clone-rust.vercel.app/api/playlists/remove",
      { playlistId: id, videoId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    loadPlaylist(); // refresh UI
  };

  /* =========================
     PLAYLIST LIST VIEW
  ========================= */
  if (!id) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Your Playlists</h2>

        {playlists.map((p) => (
          <div
            key={p._id}
            onClick={() => navigate(`/playlist/${p._id}`)}
            style={{
              cursor: "pointer",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            📁 {p.name} ({p.videos.length})
          </div>
        ))}
      </div>
    );
  }

  /* =========================
     SINGLE PLAYLIST VIEW
  ========================= */
  if (!playlist) return null;

  return (
    <div style={{ padding: 24 }}>
      <h2>{playlist.name}</h2>

      {playlist.videos.map((video) => (
        <div
          key={video._id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
            cursor: "pointer",
          }}
          onClick={() =>
            navigate(`/watch/${video._id}?playlist=${playlist._id}`)
          }
        >
          <img
            src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
            alt={video.title}
            width="160"
          />

          <p style={{ flex: 1 }}>{video.title}</p>

          <ThreeDotMenu
            mode="playlist"
            onRemove={() => removeFromPlaylist(video._id)}
          />
        </div>
      ))}
    </div>
  );
}
