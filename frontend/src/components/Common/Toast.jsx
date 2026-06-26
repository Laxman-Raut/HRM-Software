import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ toasts, setToasts }) {
  useEffect(() => {
    if (toasts.length > 0) {
      const lastToast = toasts[toasts.length - 1];
      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== lastToast.id));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts, setToasts]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="success" size={18} />;
      case "error":
        return <AlertCircle className="danger" size={18} />;
      case "info":
      default:
        return <Info className="info" size={18} />;
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type || "info"}`}>
          {getIcon(toast.type)}
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
