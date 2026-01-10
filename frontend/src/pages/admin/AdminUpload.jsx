import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import ThreeDotMenu from "../../components/ThreeDotMenu";

export default function AdminUpload() {
  const token = localStorage.getItem("token");
  const location = useLocation();

  /* ======================
     FORM STATE
  ====================== */
  const [title, setTitle] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [channelId, setChannelId] = useState("");

  const [channels, setChannels] = useState([]);
  const [videos, setVideos] = useState([]);
  const [editingId, setEditingId] = useState(null);

  /* ======================
     MEMOIZED HEADERS
  ====================== */
  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  /* ======================
     🔥 AUTO LOAD EDIT VIDEO
     (FROM CHANNEL DETAIL / ANY PAGE)
  ====================== */
  useEffect(() => {
    if (location.state?.editVideo) {
      const v = location.state.editVideo;

      setEditingId(v._id);
      setTitle(v.title);
      setYoutubeId(v.youtubeId);
      setCategory(v.category || "");
      setTags(v.tags?.join(", ") || "");
      setChannelId(v.channel?._id || "");

      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.state]);

  /* ======================
     LOAD CHANNELS
  ====================== */
  useEffect(() => {
    axios
      .get("/channels", { headers })
      .then((res) => setChannels(res.data))
      .catch(() => setChannels([]));
  }, [headers]);

  /* ======================
     LOAD VIDEOS
  ====================== */
  const loadVideos = useCallback(() => {
    axios
      .get("/videos/admin/all", { headers })
      .then((res) => setVideos(res.data))
      .catch(() => setVideos([]));
  }, [headers]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  /* ======================
     SUBMIT (UPLOAD / EDIT)
  ====================== */
  const submitVideo = async () => {
    if (!title || !youtubeId || !channelId) {
      alert("Title, YouTube ID and Channel are required");
      return;
    }

    const payload = {
      title,
      youtubeId,
      category,
      channel: channelId,
      tags: tags.split(",").map((t) => t.trim()),
    };

    if (editingId) {
      await axios.put(
        `/videos/${editingId}`,
        payload,
        { headers }
      );
    } else {
      await axios.post(
        "/videos",
        payload,
        { headers }
      );
    }

    resetForm();
    loadVideos();
  };

  /* ======================
     HELPERS
  ====================== */
  const resetForm = () => {
    setTitle("");
    setYoutubeId("");
    setCategory("");
    setTags("");
    setChannelId("");
    setEditingId(null);

    // clear navigation state
    window.history.replaceState({}, document.title);
  };

  const editVideo = (v) => {
    setEditingId(v._id);
    setTitle(v.title);
    setYoutubeId(v.youtubeId);
    setCategory(v.category || "");
    setTags(v.tags.join(", "));
    setChannelId(v.channel?._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteVideo = async (id) => {
    if (!window.confirm("Delete this video?")) return;

    await axios.delete(
      `/videos/${id}`,
      { headers }
    );

    loadVideos();
  };

  const togglePublish = async (id) => {
    await axios.put(
      `/videos/${id}/publish`,
      {},
      { headers }
    );
    loadVideos();
  };

  /* ======================
     UI
  ====================== */
  return (
    <div style={{ padding: 24 }}>
      <h2>{editingId ? "Edit Video" : "Upload Video"}</h2>

      {/* FORM */}
      <div style={formStyle}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />

        <input
          value={youtubeId}
          onChange={(e) => setYoutubeId(e.target.value)}
          placeholder="YouTube URL / ID"
        />

        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
        />

        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma separated)"
        />

        <select
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
        >
          <option value="">Select Channel</option>
          {channels.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <button onClick={submitVideo}>
          {editingId ? "Update Video" : "Upload Video"}
        </button>

        {editingId && <button onClick={resetForm}>Cancel Edit</button>}
      </div>

      {/* VIDEOS */}
      <h3 style={{ marginTop: 40 }}>Uploaded Videos</h3>

      <div style={gridStyle}>
        {videos.map((v) => (
          <div key={v._id} style={cardStyle}>
            <img
              src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`}
              alt={v.title}
              style={{ width: "100%", borderRadius: 8 }}
            />

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <p style={{ fontWeight: 500 }}>{v.title}</p>

              <ThreeDotMenu
                mode="admin"
                onEdit={() => editVideo(v)}
                onDelete={() => deleteVideo(v._id)}
                onStatus={() => togglePublish(v._id)}
              />
            </div>

            <small>{v.published ? "🟢 Published" : "🔴 Hidden"}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ======================
   STYLES
====================== */
const formStyle = {
  maxWidth: 600,
  display: "grid",
  gap: 10,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)", // ✅ cleaner UI
  gap: 16,
};

const cardStyle = {
  border: "1px solid #eee",
  padding: 10,
  borderRadius: 10,
};
