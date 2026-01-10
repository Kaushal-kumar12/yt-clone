import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    blockedUsers: 0,
    channels: 0,
    videos: 0,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    async function loadStats() {
      try {
        const [usersRes, channelsRes, videosRes] = await Promise.all([
          axios.get("https://yt-clone-rust.vercel.app/api/admin/users", { headers }),
          axios.get("https://yt-clone-rust.vercel.app/api/channels", { headers }),
          axios.get("https://yt-clone-rust.vercel.app/api/videos/admin/all", { headers }),
        ]);

        const users = usersRes.data || [];

        setStats({
          users: users.length,
          blockedUsers: users.filter((u) => u.blocked).length,
          channels: channelsRes.data.length,
          videos: videosRes.data.length,
        });
      } catch (err) {
        console.error("ADMIN DASHBOARD ERROR:", err);
      }
    }

    loadStats();
  }, [token]);

  return (
    <div className="admin-page">
      <h2 className="admin-title">Admin Dashboard</h2>

      <div className="admin-grid">
        <StatCard title="Total Users" value={stats.users} icon="👤" />
        <StatCard title="Blocked Users" value={stats.blockedUsers} icon="🚫" />
        <StatCard title="Channels" value={stats.channels} icon="📁" />
        <StatCard title="Videos" value={stats.videos} icon="🎬" />
      </div>
    </div>
  );
}

/* 🔹 Card Component */
function StatCard({ title, value, icon }) {
  return (
    <div className="admin-card">
      <div className="admin-card-icon">{icon}</div>
      <div>
        <h4>{title}</h4>
        <p>{value}</p>
      </div>
    </div>
  );
}
