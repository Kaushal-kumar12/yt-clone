import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import Watch from "./pages/Watch";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";

import LikedVideos from "./pages/LikedVideos";
import Playlists from "./pages/Playlists";
import PlaylistWatch from "./pages/PlaylistWatch";
import History from "./pages/History";

/* ADMIN */
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUpload from "./pages/admin/AdminUpload";
import AdminChannels from "./pages/admin/AdminChannels";
import AdminChannelDetail from "./pages/admin/AdminChannelDetail";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserActivity from "./pages/admin/AdminUserActivity";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* AUTH */}


        {/* USER */}
        <Route element={<MainLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/liked" element={<LikedVideos />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/playlist/:id" element={<PlaylistWatch />} />
          <Route path="/history" element={<History />} />
          <Route path="/search" element={<Search />} />
        </Route>

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="upload" element={<AdminUpload />} />
          <Route path="channels" element={<AdminChannels />} />
          <Route path="channels/:id" element={<AdminChannelDetail />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUserActivity />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
