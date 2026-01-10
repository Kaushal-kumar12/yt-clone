import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function ThreeDotMenu({
  mode = "save",

  /* common */
  onSave,
  onQueue,
  onRemove,
  onView,

  /* admin video */
  onEdit,
  onDelete,
  onStatus,

  /* admin channel */
  onRename,
  onDeleteChannel,
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const btnRef = useRef(null);
  const menuRef = useRef(null);

  /* CLOSE ON OUTSIDE CLICK */
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  /* POSITION CALCULATION */
  useEffect(() => {
    if (!open || !btnRef.current) return;

    const rect = btnRef.current.getBoundingClientRect();

    const MENU_WIDTH = 180;
    const MENU_HEIGHT = 160;
    const GAP = 6;

    let top = rect.bottom + GAP;
    let left = rect.left;

    if (top + MENU_HEIGHT > window.innerHeight) {
      top = rect.top - MENU_HEIGHT - GAP;
    }

    if (left + MENU_WIDTH > window.innerWidth) {
      left = window.innerWidth - MENU_WIDTH - GAP;
    }

    if (left < GAP) left = GAP;
    if (top < GAP) top = GAP;

    setPos({ top, left });
  }, [open]);

  return (
    <>
      {/* THREE DOT BUTTON */}
      <button
        ref={btnRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((p) => !p);
        }}
        style={styles.button}
      >
        ⋮
      </button>

      {/* MENU */}
      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ ...styles.menu, top: pos.top, left: pos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ======================
                SAVE MODE (HOME / SEARCH)
            ====================== */}
            {mode === "save" && (
              <>
                <MenuItem
                  label="Save to playlist"
                  onClick={() => {
                    setOpen(false);
                    onSave?.();
                  }}
                />

                {onQueue && (
                  <MenuItem
                    label="Add to queue"
                    onClick={() => {
                      setOpen(false);
                      onQueue();
                    }}
                  />
                )}
              </>
            )}

            {/* ======================
                LIKE MODE
            ====================== */}
            {mode === "like" && (
              <>
                {onView && (
                  <MenuItem
                    label="View"
                    onClick={() => {
                      setOpen(false);
                      onView();
                    }}
                  />
                )}

                <MenuItem
                  label="Remove from liked"
                  onClick={() => {
                    setOpen(false);
                    onRemove?.();
                  }}
                />
              </>
            )}

            {/* ======================
                ADMIN VIDEO
            ====================== */}
            {mode === "admin" && (
              <>
                <MenuItem label="Edit video" onClick={onEdit} />
                <MenuItem
                  label="Publish / Unpublish"
                  onClick={onStatus}
                />
                <MenuItem label="Delete video" onClick={onDelete} />
              </>
            )}

            {/* ======================
                ADMIN CHANNEL
            ====================== */}
            {mode === "adminChannel" && (
              <>
                <MenuItem label="Rename channel" onClick={onRename} />
                <MenuItem
                  label="Delete channel"
                  onClick={onDeleteChannel}
                />
              </>
            )}
          </div>,
          document.body
        )}
    </>
  );
}

/* MENU ITEM */
function MenuItem({ label, onClick }) {
  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.();
      }}
      style={styles.item}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "#f5f5f5")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "transparent")
      }
    >
      {label}
    </div>
  );
}

/* STYLES */
const styles = {
  button: {
    background: "none",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    padding: "4px 6px",
  },
  menu: {
    position: "fixed",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 8,
    minWidth: 180,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 9999,
    overflow: "hidden",
  },
  item: {
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: 14,
  },
};
