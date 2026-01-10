import { useEffect, useState } from "react";
import api from "../api/axios";
import VideoCard from "../components/VideoCard";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= 768
  );

  useEffect(() => {
    api
      .get("/videos/home")
      .then(res => setVideos(res.data))
      .catch(err => console.error(err));
  }, []);

  /* detect screen resize */
  useEffect(() => {
    const handleResize = () =>
      setIsMobile(window.innerWidth <= 768);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        ...styles.content,
        gridTemplateColumns: isMobile
          ? "repeat(2, 1fr)"
          : "repeat(3, 1fr)",
      }}
    >
      {videos.length === 0 ? (
        <p>No videos available</p>
      ) : (
        videos.map(video => (
          <VideoCard key={video._id} video={video} />
        ))
      )}
    </div>
  );
};

const styles = {
  content: {
    flex: 1,
    padding: "16px",
    display: "grid",
    gap: "16px",
  },
};

export default Home;
