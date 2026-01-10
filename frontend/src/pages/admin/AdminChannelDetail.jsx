import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import "../../styles/admin.css";

export default function AdminChannelDetail() {
  const { id: channelId } = useParams();
  const token = localStorage.getItem("token");

  /* ======================
     STATE
  ====================== */
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);

  // edit form
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");

  /* ======================
     AUTH HEADERS
  ====================== */
  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  /* ======================
     LOAD CHANNEL
  ====================== */
  const loadChannel = useCallback(async () => {
    const res = await axios.get(
      "/channels",
      { headers }
    );
    const found = res.data.find((c) => c._id === channelId);
    setChannel(found || null);
  }, [channelId, headers]);

  /* ======================
     LOAD VIDEOS
  ====================== */
  const loadVideos = useCallback(async () => {
    const res = await axios.get(
      `/videos/admin/channel/${channelId}`,
      { headers }
    );
    setVideos(res.data);
  }, [channelId, headers]);

  useEffect(() => {
    loadChannel();
    loadVideos();
  }, [loadChannel, loadVideos]);

  /* ======================
     ACTIONS
  ====================== */
  const editVideo = (v) => {
    setEditingId(v._id);
    setTitle(v.title);
    setYoutubeId(v.youtubeId);
    setCategory(v.category || "");
    setTags(v.tags.join(", "));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setYoutubeId("");
    setCategory("");
    setTags("");
  };

  const updateVideo = async () => {
    if (!title || !youtubeId) {
      alert("Title and YouTube ID required");
      return;
    }

    await axios.put(
      `/videos/${editingId}`,
      {
        title,
        youtubeId,
        category,
        tags: tags.split(",").map((t) => t.trim()),
      },
      { headers }
    );

    cancelEdit();
    loadVideos();
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
  if (!channel) return <p style={{ padding: 24 }}>Channel not found</p>;

  return (
    <div className="admin-page">
      <h2>📁 {channel.name}</h2>
      <p>Total Videos: {videos.length}</p>

      {/* ======================
          EDIT FORM (INLINE)
      ====================== */}
      {editingId && (
        <div className="admin-edit-form">
          <h3>Edit Video</h3>

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

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={updateVideo}>Update</button>
            <button onClick={cancelEdit}>Cancel</button>
          </div>
        </div>
      )}

      {/* ======================
          VIDEOS GRID (4 PER ROW)
      ====================== */}
      <div className="admin-grid-4">
        {videos.length === 0 && <p>No videos in this channel</p>}

        {videos.map((v) => (
          <div key={v._id} className="admin-video-card">
            <img
              src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`}
              alt={v.title}
            />

            <div className="admin-video-row">
              <p className="admin-video-title">{v.title}</p>

              <ThreeDotMenu
                mode="admin"
                onEdit={() => editVideo(v)}
                onDelete={() => deleteVideo(v._id)}
                onStatus={() => togglePublish(v._id)}
              />
            </div>

            <small>
              {v.published ? "🟢 Published" : "🔴 Hidden"}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}
