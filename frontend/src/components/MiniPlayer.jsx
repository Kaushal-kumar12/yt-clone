import { useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";
import { useEffect } from "react";

export default function MiniPlayer() {
  const navigate = useNavigate();
  const {
    playerRef,
    currentVideo,
    showMiniPlayer,
    setShowMiniPlayer,
  } = usePlayer();

  // ✅ PLAY when mini player becomes visible
  useEffect(() => {
    if (showMiniPlayer && playerRef.current) {
      playerRef.current.playVideo();
    }
  }, [showMiniPlayer, playerRef]);

  if (!showMiniPlayer || !currentVideo) return null;

  return (
    <div style={styles.wrapper}>
      {/* ✅ REAL YOUTUBE PLAYER */}
      <div style={styles.playerBox}>
        <div id="yt-player" style={{ width: "100%", height: "100%" }} />
      </div>

      <div style={styles.controls}>
        <button onClick={() => playerRef.current?.playVideo()}>▶</button>
        <button onClick={() => playerRef.current?.pauseVideo()}>⏸</button>

        <button
          onClick={() => {
            setShowMiniPlayer(false);
            navigate(`/watch/${currentVideo._id}`);
          }}
        >
          ⬆
        </button>

        <button
          onClick={() => {
            playerRef.current?.pauseVideo();
            setShowMiniPlayer(false);
          }}
        >
          ❌
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: "fixed",
    bottom: 16,
    right: 16,
    width: 320,
    background: "#000",
    borderRadius: 8,
    overflow: "hidden",
    zIndex: 9999,
  },
  playerBox: {
    width: "100%",
    height: 180,
  },
  controls: {
    display: "flex",
    justifyContent: "space-around",
    padding: 8,
  },
};
