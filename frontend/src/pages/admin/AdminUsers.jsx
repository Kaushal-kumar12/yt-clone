import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/admin.css";

export default function AdminUsers() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  /* ======================
     AUTH HEADERS
  ====================== */
  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  /* ======================
     LOAD USERS
  ====================== */
  const loadUsers = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/users",
        { headers }
      );
      setUsers(res.data);
    } catch (err) {
      alert("Failed to load users");
    }
  }, [headers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  /* ======================
     UPDATE ROLE
  ====================== */
  const updateRole = async (user, newRole) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/role/${user._id}`,
        { role: newRole },
        { headers }
      );
      loadUsers();
    } catch (err) {
      alert("Failed to update role");
    }
  };

  /* ======================
     UPDATE STATUS (FIXED)
  ====================== */
  const updateStatus = async (user) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/block/${user._id}`,
        {},
        { headers }
      );
      loadUsers();
    } catch (err) {
      if (err.response?.status === 400) {
        alert(err.response.data.message); // ⚠️ Cannot block admin
      } else {
        alert("Failed to update user status");
      }
    }
  };

  return (
    <div className="admin-page">
      <h2>Users</h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Activity</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>

              {/* ROLE */}
              <td>
                <select
                  value={u.role}
                  onChange={(e) =>
                    updateRole(u, e.target.value)
                  }
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>

              {/* STATUS (SAFE DROPDOWN) */}
              <td>
                <select
                  value={u.blocked ? "Blocked" : "Active"}
                  onChange={(e) => {
                    if (
                      u.role === "admin" &&
                      e.target.value === "Blocked"
                    ) {
                      alert("You cannot block admin");
                      return;
                    }
                    updateStatus(u);
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </td>

              {/* ACTIVITY */}
              <td>
                <button
                  onClick={() =>
                    navigate(`/admin/users/${u._id}`)
                  }
                >
                  View Activity
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
