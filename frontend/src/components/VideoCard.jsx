import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThreeDotMenu from "./ThreeDotMenu";
import PlaylistModal from "./PlaylistModal";

export default function VideoCard({ video }) {
  const navigate = useNavigate();

  const [showPlaylist, setShowPlaylist] = useState(false);

  return (
    <div style={styles.card}>
      {/* THUMBNAIL */}
      <img
        src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
        alt={video.title}
        style={styles.thumb}
        onClick={() => navigate(`/watch/${video._id}`)}
      />

      {/* TITLE + MENU */}
      <div style={styles.row}>
        <p
          style={styles.title}
          onClick={() => navigate(`/watch/${video._id}`)}
        >
          {video.title}
        </p>

        {/* 3 DOT MENU */}
        <ThreeDotMenu
          onSave={() => setShowPlaylist(true)}
        />
      </div>

      {/* PLAYLIST MODAL */}
      {showPlaylist && (
        <PlaylistModal
          videoId={video._id}
          onClose={() => setShowPlaylist(false)}
        />
      )}
    </div>
  );
}

const styles = {
  card: {
    cursor: "pointer",
  },
  thumb: {
    width: "100%",
    borderRadius: 12,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 500,
    flex: 1,
    marginRight: 8,
  },
};
