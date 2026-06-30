import React, { useState, useEffect } from "react";
import {
  Plus,
  CalendarDays,
  Pencil,
  Trash2,
  CheckCircle,
  AlertCircle,
  List,
  CalendarRange,
  Tag,
  Building2,
  Flag,
  Star,
  Loader2,
} from "lucide-react";
import HolidayFormModal from "../components/Holiday/HolidayFormModal";
import "./HolidayPage.css";

import { BASE_URL } from "../config";
const API_BASE_URL = `${BASE_URL}/api/holidays`;

const TYPE_META = {
  National: { color: "#ef4444", icon: <Flag size={13} />, cls: "holiday-tag-national" },
  Festival: { color: "#f59e0b", icon: <Star size={13} />, cls: "holiday-tag-festival" },
  Company:  { color: "#6366f1", icon: <Building2 size={13} />, cls: "holiday-tag-company" },
  Optional: { color: "#10b981", icon: <Tag size={13} />, cls: "holiday-tag-optional" },
};

export default function HolidayPage({ user }) {
  const isAdminOrHr = user && user.role !== "Employee";

  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" | "calendar"
  const [filterType, setFilterType] = useState("All");
  const [deleteId, setDeleteId] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ text: msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setHolidays(data.data || []);
      } else {
        showToast(data.message || "Failed to load holidays", "error");
      }
    } catch (err) {
      showToast("Network error. Could not load holidays.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleSave = async (formData) => {
    const token = localStorage.getItem("token");
    const isEdit = !!editingHoliday;
    const url = isEdit ? `${API_BASE_URL}/${editingHoliday._id}` : API_BASE_URL;
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to save holiday");
    }

    showToast(isEdit ? "Holiday updated!" : "Holiday created!", "success");
    fetchHolidays();
    setEditingHoliday(null);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Holiday deleted successfully", "success");
        fetchHolidays();
      } else {
        showToast(data.message || "Failed to delete", "error");
      }
    } catch (err) {
      showToast("Network error. Could not delete.", "error");
    } finally {
      setDeleteId(null);
    }
  };

  const getDaysUntil = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today! 🎉";
    if (diff < 0) return `${Math.abs(diff)}d ago`;
    if (diff === 1) return "Tomorrow";
    return `in ${diff} days`;
  };

  // Group holidays by month for calendar view
  const groupedByMonth = holidays
    .filter((h) => filterType === "All" || h.type === filterType)
    .reduce((acc, h) => {
      const month = new Date(h.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (!acc[month]) acc[month] = [];
      acc[month].push(h);
      return acc;
    }, {});

  const filteredHolidays = holidays.filter(
    (h) => filterType === "All" || h.type === filterType
  );

  const upcomingCount = holidays.filter((h) => new Date(h.date) >= new Date()).length;

  return (
    <div className="holiday-page fade-in">
      {/* Toast */}
      {toast && (
        <div
          className={`holiday-toast holiday-toast-${toast.type}`}
          style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1200 }}
        >
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="holiday-header">
        <div>
          <h1 className="page-title" style={{ fontFamily: "var(--font-heading)" }}>
            Holiday Calendar
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            {isAdminOrHr
              ? "Manage company holidays and public celebrations"
              : "View your upcoming holidays and time off schedule"}
          </p>
        </div>
        {isAdminOrHr && (
          <button
            className="btn btn-primary"
            onClick={() => { setEditingHoliday(null); setIsModalOpen(true); }}
          >
            <Plus size={16} />
            Add Holiday
          </button>
        )}
      </div>

      {/* Stats Strip */}
      <div className="holiday-stats-strip">
        {["National", "Festival", "Company", "Optional"].map((t) => {
          const count = holidays.filter((h) => h.type === t).length;
          const meta = TYPE_META[t];
          return (
            <div key={t} className="holiday-stat-pill glass-card">
              <span className={`holiday-type-tag ${meta.cls}`}>
                {meta.icon} {t}
              </span>
              <span className="holiday-stat-count">{count}</span>
            </div>
          );
        })}
        <div className="holiday-stat-pill glass-card" style={{ borderLeft: "3px solid var(--primary)" }}>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontWeight: 600 }}>
            <CalendarDays size={14} style={{ display: "inline", marginRight: 4 }} />
            Upcoming
          </span>
          <span className="holiday-stat-count">{upcomingCount}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="holiday-toolbar glass-card">
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontWeight: 600 }}>Filter:</label>
          {["All", "National", "Festival", "Company", "Optional"].map((t) => (
            <button
              key={t}
              className={`holiday-filter-btn ${filterType === t ? "active" : ""}`}
              onClick={() => setFilterType(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="view-toggler">
          <button
            className={`toggle-btn-icon ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
            title="List View"
          >
            <List size={16} />
          </button>
          <button
            className={`toggle-btn-icon ${viewMode === "calendar" ? "active" : ""}`}
            onClick={() => setViewMode("calendar")}
            title="Calendar Group View"
          >
            <CalendarRange size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-screen" style={{ minHeight: "260px" }}>
          <Loader2 className="spinner" size={36} />
          <span>Loading holidays...</span>
        </div>
      ) : filteredHolidays.length === 0 ? (
        <div className="holiday-empty glass-card">
          <CalendarDays size={52} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
          <h3 className="empty-state-title">No Holidays Found</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            {isAdminOrHr ? "Add your first holiday to get started." : "No holidays scheduled yet."}
          </p>
        </div>
      ) : viewMode === "list" ? (
        /* ─── LIST VIEW ─── */
        <div className="holiday-list">
          {filteredHolidays.map((h) => {
            const meta = TYPE_META[h.type] || TYPE_META.Company;
            const isPast = new Date(h.date) < new Date();
            return (
              <div key={h._id} className={`holiday-card glass-card ${isPast ? "holiday-card-past" : ""}`}>
                <div className="holiday-card-date-block" style={{ borderColor: meta.color }}>
                  <span className="holiday-card-day">
                    {new Date(h.date).toLocaleDateString("en-US", { day: "2-digit" })}
                  </span>
                  <span className="holiday-card-month">
                    {new Date(h.date).toLocaleDateString("en-US", { month: "short" })}
                  </span>
                  <span className="holiday-card-year">
                    {new Date(h.date).getFullYear()}
                  </span>
                </div>

                <div className="holiday-card-body">
                  <div className="holiday-card-title-row">
                    <h3 className="holiday-card-title">{h.title}</h3>
                    <span className={`holiday-type-tag ${meta.cls}`}>
                      {meta.icon} {h.type}
                    </span>
                  </div>
                  {h.description && (
                    <p className="holiday-card-desc">{h.description}</p>
                  )}
                  <span className="holiday-card-countdown" style={{ color: isPast ? "var(--text-muted)" : meta.color }}>
                    {getDaysUntil(h.date)}
                  </span>
                </div>

                {isAdminOrHr && (
                  <div className="holiday-card-actions">
                    <button
                      className="btn-icon-only"
                      title="Edit holiday"
                      onClick={() => { setEditingHoliday(h); setIsModalOpen(true); }}
                    >
                      <Pencil size={15} />
                    </button>
                    {deleteId === h._id ? (
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          className="btn-icon-only danger"
                          title="Confirm delete"
                          onClick={() => handleDelete(h._id)}
                        >
                          <CheckCircle size={15} />
                        </button>
                        <button
                          className="btn-icon-only"
                          title="Cancel"
                          onClick={() => setDeleteId(null)}
                        >
                          <AlertCircle size={15} />
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn-icon-only danger"
                        title="Delete holiday"
                        onClick={() => setDeleteId(h._id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── CALENDAR GROUP VIEW ─── */
        <div className="holiday-calendar-groups">
          {Object.entries(groupedByMonth).map(([month, items]) => (
            <div key={month} className="holiday-month-group glass-card">
              <h2 className="holiday-month-label">
                <CalendarDays size={16} style={{ color: "var(--primary)" }} />
                {month}
                <span className="holiday-month-count">{items.length} holiday{items.length > 1 ? "s" : ""}</span>
              </h2>
              <div className="holiday-month-items">
                {items.map((h) => {
                  const meta = TYPE_META[h.type] || TYPE_META.Company;
                  const isPast = new Date(h.date) < new Date();
                  return (
                    <div key={h._id} className={`holiday-cal-item ${isPast ? "holiday-cal-past" : ""}`} style={{ borderLeft: `3px solid ${meta.color}` }}>
                      <div className="holiday-cal-date">
                        <span className="holiday-cal-day-num">{new Date(h.date).getDate()}</span>
                        <span className="holiday-cal-weekday">
                          {new Date(h.date).toLocaleDateString("en-US", { weekday: "short" })}
                        </span>
                      </div>
                      <div className="holiday-cal-info">
                        <span className="holiday-cal-title">{h.title}</span>
                        <span className={`holiday-type-tag ${meta.cls}`} style={{ fontSize: "0.7rem" }}>
                          {meta.icon} {h.type}
                        </span>
                      </div>
                      {isAdminOrHr && (
                        <div className="holiday-card-actions">
                          <button
                            className="btn-icon-only"
                            onClick={() => { setEditingHoliday(h); setIsModalOpen(true); }}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="btn-icon-only danger"
                            onClick={() => handleDelete(h._id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <HolidayFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingHoliday(null); }}
        onSubmit={handleSave}
        holiday={editingHoliday}
      />
    </div>
  );
}
