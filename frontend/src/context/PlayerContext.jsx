import { createContext, useContext, useRef, useState } from "react";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const playerRef = useRef(null);

  const [currentVideo, setCurrentVideo] = useState(null);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);

  // ⬇️ store time PER VIDEO
  const [playbackMap, setPlaybackMap] = useState({});

  return (
    <PlayerContext.Provider
      value={{
        playerRef,
        currentVideo,
        setCurrentVideo,
        showMiniPlayer,
        setShowMiniPlayer,
        playbackMap,
        setPlaybackMap,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
