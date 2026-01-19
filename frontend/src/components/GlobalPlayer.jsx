import { useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";

export default function GlobalPlayer() {
  const { playerRef, setPlayerReady } = usePlayer();

  useEffect(() => {
    if (playerRef.current) return;

    const createPlayer = () => {
      playerRef.current = new window.YT.Player("yt-global-player", {
        videoId: "",
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          enablejsapi: 1,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            setPlayerReady(true); // 🔥 THIS IS THE KEY
          },
        },
      });
    };

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = createPlayer;
    } else {
      createPlayer();
    }
  }, [playerRef, setPlayerReady]);

  return null; // ❗ container is rendered ONLY in Watch.jsx
}
