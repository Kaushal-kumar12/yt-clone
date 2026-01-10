import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function MainLayout() {
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSidebar, setShowSidebar] = useState(true);

  /* Detect screen size */
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* Page-based sidebar rules */
  useEffect(() => {
    const isWatch = location.pathname.startsWith("/watch");

    if (isWatch) {
      setShowSidebar(false);        // ❗ watch page hidden
    } else if (isMobile) {
      setShowSidebar(false);        // mobile hidden
    } else {
      setShowSidebar(true);         // desktop home visible
    }
  }, [location.pathname, isMobile]);

  return (
    <>
      <Navbar
        isMobile={isMobile}
        showSidebar={showSidebar}
        toggleSidebar={() => setShowSidebar(prev => !prev)}
        hideToggle={location.pathname.startsWith("/watch") && isMobile}
      />

      <div style={{ display: "flex" }}>
        <Sidebar
          open={showSidebar}
          isMobile={isMobile}
          onClose={() => setShowSidebar(false)}
        />

        {/* Mobile overlay */}
        {isMobile && showSidebar && (
          <div
            onClick={() => setShowSidebar(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 1500,
            }}
          />
        )}

        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
