import { useEffect, useRef } from "react";

export default function YouTubePlayer({
  videoId,
  onEnded,
  title,
  channel,
  thumbnail,
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const readyRef = useRef(false);

  const hiddenRef = useRef(false);
  const pendingEndRef = useRef(false);

  /* =========================
     VISIBILITY HANDLING
  ========================= */
  useEffect(() => {
    const onVisibilityChange = () => {
      hiddenRef.current = document.visibilityState === "hidden";

      if (!hiddenRef.current && pendingEndRef.current) {
        pendingEndRef.current = false;
        onEnded();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [onEnded]);

  /* =========================
     INIT PLAYER (ONCE)
  ========================= */
  useEffect(() => {
    const createPlayer = () => {
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            readyRef.current = true;
          },
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.ENDED) {
              if (hiddenRef.current) {
                pendingEndRef.current = true;
              } else {
                onEnded();
              }
            }
          },
        },
      });
    };

    if (!window.YT || !window.YT.Player) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = createPlayer;
    } else {
      createPlayer();
    }

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================
     LOAD NEW VIDEO (SAFE)
  ========================= */
  useEffect(() => {
    if (!readyRef.current) return;
    if (!playerRef.current?.loadVideoById) return;

    playerRef.current.loadVideoById(videoId);
  }, [videoId]);

  /* =========================
     MEDIA SESSION
  ========================= */
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist: channel,
      artwork: [
        { src: thumbnail, sizes: "512x512", type: "image/png" },
      ],
    });

    navigator.mediaSession.setActionHandler("play", () =>
      playerRef.current?.playVideo()
    );
    navigator.mediaSession.setActionHandler("pause", () =>
      playerRef.current?.pauseVideo()
    );
    navigator.mediaSession.setActionHandler("nexttrack", onEnded);
  }, [title, channel, thumbnail, onEnded]);

  return <div ref={containerRef} />;
}
