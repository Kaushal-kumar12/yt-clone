import { useEffect, useState } from "react";
import api from "../api/axios";
import VideoCard from "../components/VideoCard";

const Home = () => {
  const [aiVideos, setAiVideos] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= 768
  );

  /* ======================
     LOAD AI HOME FEED
  ====================== */
  useEffect(() => {
    api
      .get("/videos/home")
      .then(res => setAiVideos(res.data || []))
      .catch(err => console.error(err));
  }, []);

  /* ======================
     LOAD ALL VIDEOS
  ====================== */
  const loadAllVideos = async () => {
    try {
      const res = await api.get("/videos/all");
      setAllVideos(res.data || []);
      setShowAll(true);
    } catch (err) {
      console.error(err);
    }
  };

  /* ======================
     RESPONSIVE GRID
  ====================== */
  useEffect(() => {
    const handleResize = () =>
      setIsMobile(window.innerWidth <= 768);

    window.addEventListener("resize", handleResize);
    return () =>
      window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* AI FEED */}
      <div
        style={{
          ...styles.content,
          gridTemplateColumns: isMobile
            ? "repeat(2, 1fr)"
            : "repeat(3, 1fr)",
        }}
      >
        {aiVideos.length === 0 ? (
          <p>No videos available</p>
        ) : (
          aiVideos.map(video => (
            <VideoCard key={video._id} video={video} />
          ))
        )}
      </div>

      {/* VIEW ALL BUTTON */}
      {!showAll && aiVideos.length > 0 && (
        <div style={styles.viewAllWrap}>
          <button
            style={styles.viewAllBtn}
            onClick={loadAllVideos}
          >
            View All Videos
          </button>
        </div>
      )}

      {/* ALL VIDEOS */}
      {showAll && (
        <div
          style={{
            ...styles.content,
            gridTemplateColumns: isMobile
              ? "repeat(2, 1fr)"
              : "repeat(3, 1fr)",
            marginTop: 24,
          }}
        >
          {allVideos.map(video => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </>
  );
};

const styles = {
  content: {
    flex: 1,
    padding: "16px",
    display: "grid",
    gap: "16px",
  },
  viewAllWrap: {
    textAlign: "center",
    margin: "24px 0",
  },
  viewAllBtn: {
    padding: "10px 24px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    background: "#f9f9f9",
    cursor: "pointer",
  },
};

export default Home;
