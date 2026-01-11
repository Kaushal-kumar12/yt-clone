import { useEffect, useRef, useState, useCallback } from "react";
import {
  useParams,
  useNavigate,
  useOutletContext,
  useSearchParams,
} from "react-router-dom";
import api from "../api/axios";
import PlaylistModal from "../components/PlaylistModal";
import ThreeDotMenu from "../components/ThreeDotMenu";

export default function Watch() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const playlistId = searchParams.get("playlist");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const outletContext = useOutletContext() || {};
  const setShowSidebar = outletContext.setShowSidebar;

  const playerRef = useRef(null);

  /* =====================
     STATE
  ===================== */
  const [video, setVideo] = useState(null);
  const [suggested, setSuggested] = useState([]);
  const [playlistVideos, setPlaylistVideos] = useState([]);

  /* 🔥 QUEUE (NORMAL MODE ONLY) */
  const [queue, setQueue] = useState([]);

  const [liked, setLiked] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const currentQueueIndexRef = useRef(null);

  const [autoplay, setAutoplay] = useState(
    localStorage.getItem("autoplay") !== "off"
  );

  const [loopPlaylist, setLoopPlaylist] = useState(
    localStorage.getItem("loopPlaylist") === "on"
  );

  /* =====================
     🔒 REFS (NO RERENDER)
  ===================== */
  const autoplayRef = useRef(autoplay);
  const loopRef = useRef(loopPlaylist);
  const queueRef = useRef(queue);

  const playedSuggestedRef = useRef(new Set());
  const nextVideoRef = useRef(null);

  useEffect(() => {
    autoplayRef.current = autoplay;
  }, [autoplay]);

  useEffect(() => {
    loopRef.current = loopPlaylist;
  }, [loopPlaylist]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  /* =====================
     QUEUE HELPERS
  ===================== */
  const addToQueue = (v) => {
    if (playlistId) return;

    setQueue((prev) => {
      // If queue empty → add current video first
      if (prev.length === 0 && video) {
        currentQueueIndexRef.current = 0;
        return [video, v];
      }

      // Prevent duplicates
      if (prev.some((x) => x._id === v._id)) return prev;

      return [...prev, v];
    });
  };

  // Destroy Queue
  const clearQueue = () => {
    setQueue([]);
    currentQueueIndexRef.current = -1; // reset pointer
  };

  /* =====================
     SAVE TO PLAYLIST
  ===================== */
  const openSave = (videoId) => {
    setSelectedVideoId(videoId);
    setShowPlaylist(true);
  };

  /* =====================
     SIDEBAR
  ===================== */
  useEffect(() => {
    if (typeof setShowSidebar === "function") {
      setShowSidebar(false);
      return () => setShowSidebar(true);
    }
  }, [setShowSidebar]);

  /* =====================
     LOAD VIDEO
  ===================== */
  useEffect(() => {
    api
      .get(`/videos/${id}`)
      .then((res) => setVideo(res.data))
      .catch(() => setVideo(null));
  }, [id]);

  /* =====================
   SAVE WATCH HISTORY
===================== */
  useEffect(() => {
    if (!video?._id || !token) return;

    api.post(
      "/activity/watch",
      { videoId: video._id },
      { headers: { Authorization: `Bearer ${token}` } }
    ).catch(() => {
      // silent fail (optional)
    });
  }, [video?._id, token]);


  /* ✅ MARK PLAYED (NORMAL MODE ONLY) */
  useEffect(() => {
    if (!playlistId && video?._id) {
      playedSuggestedRef.current.add(video._id);
      nextVideoRef.current = null; // reset lock on new video
    }
  }, [video, playlistId]);

  /* =====================
     LOAD SUGGESTED
  ===================== */
  useEffect(() => {
    if (playlistId) return;

    api
      .get("/videos/home")
      .then((res) =>
        setSuggested(res.data.filter((v) => v._id !== id))
      );
  }, [id, playlistId]);

  /* =====================
     LOAD PLAYLIST
  ===================== */
  useEffect(() => {
    if (!playlistId) return;

    api
      .get(`/playlists/${playlistId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPlaylistVideos(res.data.videos));
  }, [playlistId, token]);

  /* =====================
     LIKE STATUS
  ===================== */
  useEffect(() => {
    if (!token || !video) return;

    api
      .get("/likes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) =>
        setLiked(res.data.some((l) => l.video?._id === video._id))
      );
  }, [video, token]);

  const likeVideo = async () => {
    await api.post(
      "/likes",
      { videoId: video._id },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setLiked((p) => !p);
  };

  /* =====================
     AUTOPLAY NEXT (LOCKED)
  ===================== */
  const handleAutoPlayNext = useCallback(() => {
    if (!autoplayRef.current) return;

    // 🔥 QUEUE FIRST
    if (!playlistId && queueRef.current.length > 0) {
      const nextIndex =
        currentQueueIndexRef.current + 1;

      if (queueRef.current[nextIndex]) {
        currentQueueIndexRef.current = nextIndex;
        navigate(`/watch/${queueRef.current[nextIndex]._id}`);
        return;
      }
    }


    // 🔁 PLAYLIST MODE
    if (playlistId && playlistVideos.length > 0) {
      const index = playlistVideos.findIndex((v) => v._id === id);
      let next = playlistVideos[index + 1];

      if (!next && loopRef.current) {
        next = playlistVideos[0];
      }

      if (next) {
        navigate(`/watch/${next._id}?playlist=${playlistId}`);
      }
      return;
    }

    // ▶ NORMAL MODE (CONSISTENT RANDOM)
    if (suggested.length > 0) {
      if (!nextVideoRef.current) {
        const unplayed = suggested.filter(
          (v) => !playedSuggestedRef.current.has(v._id)
        );

        const pool = unplayed.length > 0 ? unplayed : suggested;

        if (unplayed.length === 0) {
          playedSuggestedRef.current.clear();
        }

        nextVideoRef.current =
          pool[Math.floor(Math.random() * pool.length)];
      }

      const next = nextVideoRef.current;
      nextVideoRef.current = null;
      navigate(`/watch/${next._id}`);
    }
  }, [playlistId, playlistVideos, id, navigate, suggested]);

  /* =====================
     YOUTUBE PLAYER
  ===================== */
  useEffect(() => {
    if (!video) return;

    const loadPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player("yt-player", {
        videoId: video.youtubeId,
        playerVars: { autoplay: 1, rel: 0 },
        events: {
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.ENDED) {
              handleAutoPlayNext();
            }
          },
        },
      });
    };

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = loadPlayer;
    } else {
      loadPlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };

    // 👇 THIS IS REQUIRED & SAFE
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video?.youtubeId]);


  /* =====================
     UP NEXT PREVIEW (SAME SOURCE)
  ===================== */
  const upNext = (() => {
    // 🔥 QUEUE MODE
    if (!playlistId && queue.length > 0) {
      const idx = currentQueueIndexRef.current;
      if (idx !== null && queue[idx + 1]) {
        return queue[idx + 1];
      }
      return null;
    }

    // 🔁 PLAYLIST MODE
    if (playlistId && playlistVideos.length > 0) {
      const index = playlistVideos.findIndex((v) => v._id === id);
      return playlistVideos[index + 1] || null;
    }

    // ▶ NORMAL MODE
    if (suggested.length > 0) {
      if (!nextVideoRef.current) {
        const unplayed = suggested.filter(
          (v) => !playedSuggestedRef.current.has(v._id)
        );

        const pool = unplayed.length > 0 ? unplayed : suggested;
        nextVideoRef.current =
          pool[Math.floor(Math.random() * pool.length)];
      }
      return nextVideoRef.current;
    }

    return null;
  })();

  if (!video) return <p style={{ padding: 20 }}>Video unavailable</p>;

  return (
    <>
      <div className="watch-page">
        <div className="watch-main">
          <div className="player-container">
            <div className="player-inner">
              <div id="yt-player" />
            </div>
          </div>

          {upNext && autoplay && (
            <div
              className="suggest-card"
              style={{ marginTop: 12 }}
              onClick={() =>
                navigate(
                  playlistId
                    ? `/watch/${upNext._id}?playlist=${playlistId}`
                    : `/watch/${upNext._id}`
                )
              }
            >
              <img
                src={`https://img.youtube.com/vi/${upNext.youtubeId}/mqdefault.jpg`}
                alt={upNext.title}
              />
              <div className="suggest-info">
                <p style={{ fontSize: 12, color: "#6b7280" }}>Up next</p>
                <p className="suggest-title">{upNext.title}</p>
              </div>
            </div>
          )}

          <h1 className="title">{video.title}</h1>

          <p
            className="channel-name"
            onClick={() => navigate(`/channel/${video.channel?._id}`)}
          >
            {video.channel?.name}
          </p>


          <div className="actions">
            <button
              className={`action-btn ${liked ? "active like" : ""}`}
              onClick={likeVideo}
            >
              👍 {liked ? "Liked" : "Like"}
            </button>

            <button
              className={`action-btn ${autoplay ? "active autoplay" : ""}`}
              onClick={() => setAutoplay((p) => !p)}
            >
              🔁 Autoplay {autoplay ? "On" : "Off"}
            </button>

            {playlistId && (
              <button
                className={`action-btn ${loopPlaylist ? "active loop" : ""}`}
                onClick={() => setLoopPlaylist((p) => !p)}
              >
                🔁 Loop {loopPlaylist ? "On" : "Off"}
              </button>
            )}

            <button
              className="action-btn save"
              onClick={() => openSave(video._id)}
            >
              💾 Save
            </button>
          </div>

        </div>

        <div className="suggested">
          {queue.length > 0 && !playlistId && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <h3 style={{ margin: 0 }}>Queue</h3>

                <button
                  onClick={clearQueue}
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  Clear
                </button>
              </div>

              {queue.map((v) => (
                <div
                  key={v._id}
                  className={`suggest-card ${v._id === video._id ? "queue-active" : ""
                    }`}
                  onClick={() => {
                    const index = queue.findIndex(q => q._id === v._id);
                    currentQueueIndexRef.current = index;
                    navigate(`/watch/${v._id}`);
                  }}
                >

                  <img
                    src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`}
                    alt={v.title}
                  />
                  <div className="suggest-info">
                    <p className="suggest-title">{v.title}</p>
                  </div>
                </div>
              ))}
            </>
          )}

          <h3>{playlistId ? "Playlist" : "Suggested"}</h3>

          {(playlistId ? playlistVideos : suggested).map((v) => (
            <div
              key={v._id}
              className="suggest-card"
              onClick={() =>
                navigate(
                  playlistId
                    ? `/watch/${v._id}?playlist=${playlistId}`
                    : `/watch/${v._id}`
                )
              }
            >
              <img
                src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`}
                alt={v.title}
              />
              <div className="suggest-info">
                <p className="suggest-title">{v.title}</p>
                <p
                  className="suggest-channel"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/channel/${v.channel?._id}`);
                  }}
                >
                  {v.channel?.name}
                </p>
                {!playlistId && (
                  <div className="suggest-dot">
                    <ThreeDotMenu
                      onSave={() => openSave(v._id)}
                      onQueue={() => addToQueue(v)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showPlaylist && (
        <PlaylistModal
          videoId={selectedVideoId}
          onClose={() => setShowPlaylist(false)}
        />
      )}
    </>
  );
}
