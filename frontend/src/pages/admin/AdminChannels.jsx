import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import "../../styles/admin.css";

export default function AdminChannels() {
  const [channels, setChannels] = useState([]);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  /* ======================
     MEMOIZED HEADERS
  ====================== */
  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  /* ======================
     LOAD CHANNELS
  ====================== */
  const loadChannels = useCallback(() => {
    axios
      .get("http://localhost:5000/api/channels", { headers })
      .then((res) => setChannels(res.data))
      .catch(() => setChannels([]));
  }, [headers]);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  /* ======================
     CREATE CHANNEL
  ====================== */
  const createChannel = async () => {
    if (!name.trim()) return alert("Channel name required");

    await axios.post(
      "http://localhost:5000/api/channels",
      { name },
      { headers }
    );

    setName("");
    loadChannels();
  };

  /* ======================
     RENAME CHANNEL
  ====================== */
  const renameChannel = async (channel) => {
    const newName = prompt("Enter new channel name", channel.name);
    if (!newName) return;

    await axios.put(
      `http://localhost:5000/api/channels/${channel._id}`,
      { name: newName },
      { headers }
    );

    loadChannels();
  };

  /* ======================
     DELETE CHANNEL
  ====================== */
  const deleteChannel = async (channel) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/channels/${channel._id}`,
        { headers }
      );

      loadChannels();
    } catch (err) {
      // channel has videos → confirm force delete
      if (err.response?.data?.requireConfirm) {
        const ok = window.confirm(
          `This channel contains ${err.response.data.count} videos.\nDelete channel with all videos?`
        );

        if (ok) {
          await axios.delete(
            `http://localhost:5000/api/channels/${channel._id}?force=true`,
            { headers }
          );
          loadChannels();
        }
      }
    }
  };

  /* ======================
     UI
  ====================== */
  return (
    <div className="admin-page">
      <h2>Channels</h2>

      {/* CREATE CHANNEL */}
      <div className="admin-form">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Channel name"
        />
        <button onClick={createChannel}>Create</button>
      </div>

      {/* CHANNEL GRID */}
      <div style={gridStyle}>
        {channels.map((ch) => (
          <div key={ch._id} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/admin/channels/${ch._id}`)}
              >
                📁 <b>{ch.name}</b>
              </div>

              <ThreeDotMenu
                mode="adminChannel"
                onRename={() => renameChannel(ch)}
                onDeleteChannel={() => deleteChannel(ch)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ======================
   STYLES
====================== */

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)", // ✅ 5 per row
  gap: 20,
  marginTop: 20,
};

const cardStyle = {
  padding: 16,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#fff",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
};
