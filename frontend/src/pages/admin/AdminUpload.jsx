import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api/axios";
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
  const [published, setPublished] = useState(true);

  const [channels, setChannels] = useState([]);
  const [videos, setVideos] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [bulkLinks, setBulkLinks] = useState("");

  /* ======================
     HEADERS
  ====================== */
  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  /* ======================
     AUTO LOAD EDIT VIDEO
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
    api.get("/channels", { headers })
      .then(res => setChannels(res.data))
      .catch(() => setChannels([]));
  }, [headers]);

  /* ======================
     SAFE AUTO TITLE FETCH ✅
  ====================== */
  const fetchTitle = async (url) => {
    if (
      !url ||
      url.includes("playlist?list=") ||
      url.includes("&list=")
    ) {
      return; // ❌ block playlists
    }

    if (
      !url.includes("watch?v=") &&
      !url.includes("youtu.be/")
    ) {
      return; // ❌ not a video URL
    }

    try {
      const res = await api.get("/utils/youtube-meta", {
        params: { url },
      });
      setTitle(res.data.title);
    } catch {
      console.warn("Title fetch failed");
    }
  };

  /* ======================
     DRAG & DROP
  ====================== */
  const handleDrop = (e) => {
    e.preventDefault();
    const url = e.dataTransfer.getData("text");
    setYoutubeId(url);
    fetchTitle(url);
  };

  /* ======================
     LOAD VIDEOS
  ====================== */
  const loadVideos = useCallback(() => {
    api.get("/videos/admin/all", { headers })
      .then(res => setVideos(res.data))
      .catch(() => setVideos([]));
  }, [headers]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  /* ======================
     SUBMIT VIDEO
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
      tags: tags.split(",").map(t => t.trim()),
      published,
    };

    if (editingId) {
      await api.put(`/videos/${editingId}`, payload, { headers });
    } else {
      await api.post("/videos", payload, { headers });
    }

    resetForm();
    loadVideos();
  };

  /* ======================
     BULK UPLOAD (SAFE) ✅
  ====================== */
  const handleBulkUpload = async () => {
    if (!channelId) {
      alert("Select channel first");
      return;
    }

    const links = bulkLinks
      .split("\n")
      .map(l => l.trim())
      .filter(l =>
        l.includes("watch?v=") || l.includes("youtu.be/")
      );

    for (const link of links) {
      try {
        let title = "Untitled Video";

        try {
          const meta = await api.get("/utils/youtube-meta", {
            params: { url: link },
          });
          title = meta.data.title;
        } catch {
          console.warn("Meta fetch failed, using fallback title");
        }

        await api.post(
          "/videos",
          {
            title,
            youtubeId: link,
            category: category || "General", // ✅ REQUIRED
            tags: [],
            channel: channelId,
            published,
          },
          { headers }
        );
      } catch (err) {
        console.error("Bulk upload failed for:", link);
      }
    }

    setBulkLinks("");
    alert("Bulk upload completed");
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
    await api.delete(`/videos/${id}`, { headers });
    loadVideos();
  };

  const togglePublish = async (id) => {
    await api.put(`/videos/${id}/publish`, {}, { headers });
    loadVideos();
  };

  /* ======================
     UI
  ====================== */
  return (
    <div style={{ padding: 24 }}>
      <h2>{editingId ? "Edit Video" : "Upload Video"}</h2>

      {/* DRAG ZONE */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        style={{
          border: "2px dashed #aaa",
          padding: 20,
          marginBottom: 12,
          textAlign: "center",
          borderRadius: 8,
        }}
      >
        Drag & drop YouTube video link here
      </div>

      <div style={formStyle}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />

        <input
          value={youtubeId}
          onChange={(e) => {
            const val = e.target.value;
            setYoutubeId(val);
            fetchTitle(val);
          }}
          placeholder="YouTube URL / ID"
        />

        <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" />
        <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags" />

        <select value={channelId} onChange={e => setChannelId(e.target.value)}>
          <option value="">Select Channel</option>
          {channels.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <label style={{ display: "flex", gap: 6 }}>
          <input type="checkbox" checked={published} onChange={() => setPublished(p => !p)} />
          Publish immediately
        </label>

        <button onClick={submitVideo}>
          {editingId ? "Update Video" : "Upload Video"}
        </button>
        {editingId && <button onClick={resetForm}>Cancel Edit</button>}
      </div>

      {/* BULK UPLOAD */}
      <textarea
        placeholder="Paste multiple YouTube VIDEO links (one per line)"
        rows={4}
        style={{ width: "100%", marginTop: 20 }}
        value={bulkLinks}
        onChange={(e) => setBulkLinks(e.target.value)}
      />

      <button onClick={handleBulkUpload} style={{ marginTop: 8 }}>
        Bulk Upload
      </button>

      {/* VIDEOS */}
      <h3 style={{ marginTop: 40 }}>Uploaded Videos</h3>
      <p>Total Videos: {videos.length}</p>

      <div style={gridStyle}>
        {videos.map(v => (
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

/* STYLES */
const formStyle = { maxWidth: 600, display: "grid", gap: 10 };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 };
const cardStyle = { border: "1px solid #eee", padding: 10, borderRadius: 10 };
