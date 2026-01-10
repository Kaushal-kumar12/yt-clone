import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import ThreeDotMenu from "../components/ThreeDotMenu";
import PlaylistModal from "../components/PlaylistModal";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Playlist modal state
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(null);

  const openSave = (videoId) => {
    setSelectedVideoId(videoId);
    setShowPlaylist(true);
  };

  /* =====================
     LOAD SEARCH RESULTS
  ===================== */
  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    axios
      .get(`http://localhost:5000/api/videos/search?q=${query}`)
      .then((res) => setResults(res.data))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query]);

  if (loading) {
    return <p style={{ padding: 20 }}>Searching...</p>;
  }

  return (
    <>
      <div className="search-page">
        {results.length === 0 && (
          <p style={{ padding: 20 }}>No results found</p>
        )}

        {results.map((v) => (
          <div
            key={v._id}
            className="search-card"
            onClick={() => navigate(`/watch/${v._id}`)}
          >
            <img
              src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`}
              alt={v.title}
            />

            <div className="search-info">
              <h3 className="search-title">{v.title}</h3>

              <p
                className="search-channel"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/channel/${v.channel?._id}`);
                }}
              >
                {v.channel?.name}
              </p>

              {/* ✅ Three dot menu */}
              <div className="search-dot" onClick={(e) => e.stopPropagation()}>
                <ThreeDotMenu
                  onSave={() => openSave(v._id)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Playlist Modal */}
      {showPlaylist && (
        <PlaylistModal
          videoId={selectedVideoId}
          onClose={() => setShowPlaylist(false)}
        />
      )}
    </>
  );
}
