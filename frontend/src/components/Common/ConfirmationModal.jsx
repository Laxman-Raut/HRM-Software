import React from "react";
import { X, AlertTriangle } from "lucide-react";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to perform this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger" // "danger", "warning", "primary"
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose} 
      style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        zIndex: 1100 
      }}
    >
      <div 
        className="modal-content glass-card fade-in" 
        style={{ 
          maxWidth: "400px", 
          width: "100%", 
          padding: "2rem", 
          position: "relative" 
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close-btn"
          style={{ 
            position: "absolute", 
            top: "1rem", 
            right: "1rem", 
            background: "none", 
            border: "none", 
            color: "var(--text-secondary)", 
            cursor: "pointer" 
          }}
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: `var(--${type}-light)`,
            color: `var(--${type})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem auto"
          }}>
            <AlertTriangle size={24} />
          </div>
          <h3 className="modal-title" style={{ fontFamily: "var(--font-heading)", marginBottom: "0.5rem" }}>
            {title}
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            {message}
          </p>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className={`btn btn-${type === "danger" ? "danger" : "primary"}`}
            style={{ flex: 1 }}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
