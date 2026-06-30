import React, { useState, useEffect } from "react";
import {
  Megaphone,
  Plus,
  Trash2,
  Calendar,
  User,
  Loader2,
  CheckCircle,
  AlertCircle,
  Users,
} from "lucide-react";
import "./AnnouncementPage.css";

import { BASE_URL } from "../config";
const API_BASE_URL = `${BASE_URL}/api/announcements`;

export default function AnnouncementPage({ user }) {
  const isAdminOrHr = user && user.role !== "Employee";

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterAudience, setFilterAudience] = useState("All");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAudience: "ALL",
    priority: "Medium",
    expiryDate: "",
  });
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ text: msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAnnouncements(data.data || []);
      } else {
        showToast(data.message || "Failed to load announcements", "error");
      }
    } catch (err) {
      showToast("Network error. Could not load announcements.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    setFormSubmitLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
      };

      const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Announcement posted successfully!", "success");
        fetchAnnouncements();
        setIsModalOpen(false);
        setFormData({
          title: "",
          description: "",
          targetAudience: "ALL",
          priority: "Medium",
          expiryDate: "",
        });
      } else {
        showToast(data.message || "Failed to post announcement.", "error");
      }
    } catch (err) {
      showToast("Network error. Failed to post announcement.", "error");
    } finally {
      setFormSubmitLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Announcement deleted successfully!", "success");
        fetchAnnouncements();
      } else {
        showToast(data.message || "Failed to delete announcement.", "error");
      }
    } catch (err) {
      showToast("Network error. Failed to delete announcement.", "error");
    } finally {
      setDeleteId(null);
    }
  };

  // Filter logic
  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesSearch =
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      filterPriority === "All" || ann.priority === filterPriority;
    const matchesAudience =
      filterAudience === "All" || ann.targetAudience === filterAudience;

    return matchesSearch && matchesPriority && matchesAudience;
  });

  return (
    <div className="announcements-page container">
      {/* Toast Alert */}
      {toast && (
        <div className={`custom-toast ${toast.type}`}>
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <header className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Megaphone className="title-icon" /> Announcements
          </h1>
          <p className="page-subtitle">
            Stay up to date with the latest organization news and updates.
          </p>
        </div>
        {isAdminOrHr && (
          <button className="btn btn-primary flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Create Announcement
          </button>
        )}
      </header>

      {/* Filters Bar */}
      <section className="filters-card">
        <div className="filters-grid">
          <div className="search-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="filter-group">
            <label>Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="form-control"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Target Audience</label>
            <select
              value={filterAudience}
              onChange={(e) => setFilterAudience(e.target.value)}
              className="form-control"
            >
              <option value="All">All Audiences</option>
              <option value="ALL">Everyone</option>
              <option value="HR">HR Only</option>
              <option value="Employee">Employees Only</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main List */}
      {loading ? (
        <div className="loading-state flex flex-col items-center justify-center">
          <Loader2 className="spinner" size={40} />
          <p>Loading announcements...</p>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="empty-state text-center">
          <Megaphone size={50} className="empty-icon" />
          <h3>No announcements found</h3>
          <p>There are no announcements matching your filters at this time.</p>
        </div>
      ) : (
        <div className="announcements-grid">
          {filteredAnnouncements.map((ann) => {
            const dateStr = new Date(ann.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const expiryStr = ann.expiryDate
              ? new Date(ann.expiryDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : null;

            return (
              <article key={ann._id} className={`announcement-card priority-${ann.priority.toLowerCase()}`}>
                <div className="card-header flex justify-between items-start">
                  <div className="badge-row flex gap-2 flex-wrap">
                    <span className={`priority-badge badge-${ann.priority.toLowerCase()}`}>
                      {ann.priority} Priority
                    </span>
                    <span className="audience-badge">
                      <Users size={12} className="inline mr-1" />
                      {ann.targetAudience === "ALL"
                        ? "Everyone"
                        : ann.targetAudience === "HR"
                        ? "HR Only"
                        : "Employees"}
                    </span>
                    {expiryStr && (
                      <span className="expiry-badge">
                        Expires: {expiryStr}
                      </span>
                    )}
                  </div>

                  {isAdminOrHr && (
                    <button
                      className="delete-card-btn"
                      onClick={() => setDeleteId(ann._id)}
                      title="Delete Announcement"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="card-body">
                  <h3 className="announcement-title">{ann.title}</h3>
                  <p className="announcement-desc">{ann.description}</p>
                </div>

                <div className="card-footer flex justify-between items-center">
                  <span className="footer-author flex items-center gap-1">
                    <User size={14} />
                    {ann.createdBy} ({ann.createdByRole})
                  </span>
                  <span className="footer-date flex items-center gap-1">
                    <Calendar size={14} />
                    {dateStr}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <div className="modal-backdrop">
          <div className="custom-modal confirm-delete-modal">
            <h3 className="modal-title">Delete Announcement</h3>
            <p className="modal-body-text">
              Are you sure you want to delete this announcement? This action cannot be undone.
            </p>
            <div className="modal-actions flex justify-end gap-2 mt-4">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteAnnouncement(deleteId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="custom-modal announcement-form-modal">
            <div className="modal-header flex justify-between items-center">
              <h3 className="modal-title">New Announcement</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="modal-form">
              <div className="form-group">
                <label className="required-label">Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Annual General Meeting"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="required-label">Description</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Details of the announcement..."
                  className="form-control"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Target Audience</label>
                  <select
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value="ALL">Everyone</option>
                    <option value="HR">HR Only</option>
                    <option value="Employee">Employees Only</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Expiry Date (Optional)</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  className="form-control"
                />
                <span className="field-hint">
                  The announcement will automatically hide after this date for Employees.
                </span>
              </div>

              <div className="modal-actions flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitLoading}
                  className="btn btn-primary flex items-center gap-1"
                >
                  {formSubmitLoading ? (
                    <>
                      <Loader2 className="spinner" size={16} /> Posting...
                    </>
                  ) : (
                    "Post Announcement"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
