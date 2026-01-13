import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
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

  // upload form state (NEW)
  const [newTitle, setNewTitle] = useState("");
  const [newYoutubeId, setNewYoutubeId] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newTags, setNewTags] = useState("");
  const [uploading, setUploading] = useState(false);


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
     FETCH VIDEO TITLE
  ====================== */
  const fetchTitle = async (url) => {
    try {
      const res = await api.get("/utils/youtube-meta", {
        params: { url },
      });
      setNewTitle(res.data.title);
    } catch { }
  };


  /* ======================
     LOAD CHANNEL
  ====================== */
  const loadChannel = useCallback(async () => {
    const res = await api.get(
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
    const res = await api.get(
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

    await api.put(
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

    await api.delete(
      `/videos/${id}`,
      { headers }
    );
    loadVideos();
  };

  const togglePublish = async (id) => {
    await api.put(
      `/videos/${id}/publish`,
      {},
      { headers }
    );
    loadVideos();
  };

  const uploadNewVideo = async () => {
    if (!newTitle || !newYoutubeId) {
      alert("Title and YouTube ID required");
      return;
    }

    try {
      setUploading(true);

      await api.post(
        "/videos",
        {
          title: newTitle,
          youtubeId: newYoutubeId,
          category: newCategory,
          channel: channelId, // 🔥 AUTO channel
          tags: newTags.split(",").map(t => t.trim()),
        },
        { headers }
      );

      // reset form
      setNewTitle("");
      setNewYoutubeId("");
      setNewCategory("");
      setNewTags("");

      loadVideos(); // 🔄 refresh list
    } catch (err) {
      alert("Failed to upload video");
    } finally {
      setUploading(false);
    }
  };


  /* ======================
     UI
  ====================== */
  if (!channel) return <p style={{ padding: 24 }}>Channel not found</p>;

  return (
    <div className="admin-page">
      <h2>📁 {channel.name}</h2>

      {/* ======================
        UPLOAD NEW VIDEO (INLINE)
      ====================== */}
      <div className="admin-edit-form">
        <h3>Add New Video</h3>

        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Title"
        />

        <input
          value={newYoutubeId}
          onChange={(e) => {
            setNewYoutubeId(e.target.value);
            fetchTitle(e.target.value);
          }}
          placeholder="YouTube URL / ID"
        />


        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Category"
        />

        <input
          value={newTags}
          onChange={(e) => setNewTags(e.target.value)}
          placeholder="Tags (comma separated)"
        />

        <button onClick={uploadNewVideo} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Video"}
        </button>
      </div>


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
