import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Layers,
  Heart,
  Globe,
  Edit3,
  Save,
  X,
  Loader2,
  Building,
  Flag,
  FileText,
  UserCheck,
  Code,
  Link2,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import "./ProfilePage.css";
import { BASE_URL } from "../config";

const API_BASE_URL = `${BASE_URL}/api/profile`;

export default function ProfilePage({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("personal"); // "personal" | "address" | "emergency" | "promotions"
  const [toast, setToast] = useState(null);
  const [promotions, setPromotions] = useState([]);

  const [formData, setFormData] = useState({
    phone: "",
    dateOfBirth: "",
    gender: "Male",
    maritalStatus: "Single",
    bloodGroup: "O+",
    nationality: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: ""
    },
    bio: "",
    linkedin: "",
    github: "",
    website: ""
  });

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && data.success && data.data) {
        setProfile(data.data);
        setHasProfile(true);
        // Map backend data to form fields
        setFormData({
          phone: data.data.phone || "",
          dateOfBirth: data.data.dateOfBirth ? new Date(data.data.dateOfBirth).toISOString().split("T")[0] : "",
          gender: data.data.gender || "Male",
          maritalStatus: data.data.maritalStatus || "Single",
          bloodGroup: data.data.bloodGroup || "O+",
          nationality: data.data.nationality || "",
          address: data.data.address || "",
          city: data.data.city || "",
          state: data.data.state || "",
          country: data.data.country || "",
          zipCode: data.data.zipCode || "",
          emergencyContact: {
            name: data.data.emergencyContact?.name || "",
            relationship: data.data.emergencyContact?.relationship || "",
            phone: data.data.emergencyContact?.phone || ""
          },
          bio: data.data.bio || "",
          linkedin: data.data.linkedin || "",
          github: data.data.github || "",
          website: data.data.website || ""
        });
      } else if (res.status === 404) {
        // Profile doesn't exist yet
        setHasProfile(false);
        setProfile(null);
      } else {
        showToast(data.message || "Failed to load profile details", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Could not reach profiles server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeePromotions = async (empId) => {
    if (!empId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/promotions/employee/${empId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPromotions(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load user promotions:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
    if (user?.id) {
      fetchEmployeePromotions(user.id);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("emergencyContact.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const method = hasProfile ? "PUT" : "POST";
      const res = await fetch(API_BASE_URL, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(hasProfile ? "Profile updated successfully!" : "Profile initialized successfully!", "success");
        setIsEditing(false);
        fetchProfile();
        if (typeof window.reloadProfilePhoto === "function") {
          window.reloadProfilePhoto();
        }
      } else {
        showToast(data.message || "Failed to submit profile data", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Failed to save details.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Helper for displaying user name / info safely
  const employeeInfo = profile?.employee || user || {};
  const firstName = employeeInfo.firstName || "User";
  const lastName = employeeInfo.lastName || "";
  const fullName = firstName + " " + lastName;
  const email = employeeInfo.email || "";
  const designation = employeeInfo.designation || "Staff Member";
  const department = employeeInfo.department || "Operations";
  const empId = employeeInfo.employeeId || "N/A";
  const salary = employeeInfo.salary ? `₹${employeeInfo.salary.toLocaleString("en-IN")}/yr` : "N/A";
  const joiningDate = employeeInfo.joiningDate ? new Date(employeeInfo.joiningDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A";

  const getInitials = () => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : "";
    const last = lastName ? lastName.charAt(0).toUpperCase() : "";
    return first + last || "?";
  };

  if (loading) {
    return (
      <div className="profile-loading-container fade-in">
        <Loader2 size={40} className="spinner" />
        <span>Loading personal records...</span>
      </div>
    );
  }

  return (
    <div className="profile-page-container fade-in">
      {/* Toast Alert */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <FileText size={18} />
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <header className="profile-page-header">
        <div className="header-info">
          <div className="header-icon-wrapper">
            <User size={22} className="header-icon" />
          </div>
          <div>
            <h1>My Profile</h1>
            <p className="subtitle">View and update your personal dashboard and contact info.</p>
          </div>
        </div>
        {!isEditing ? (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            <Edit3 size={16} />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn btn-secondary" onClick={() => setIsEditing(false)} disabled={saving}>
              <X size={16} />
              <span>Cancel</span>
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={16} className="spinner" /> : <Save size={16} />}
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Dual-pane Layout */}
      <div className="profile-layout-grid">
        {/* Left summary card */}
        <aside className="profile-summary-card glass-card">
          <div className="profile-avatar-wrapper">
            <div className="profile-initials-avatar">{getInitials()}</div>
          </div>
          
          <div className="profile-summary-info">
            <h2>{fullName}</h2>
            <span className="profile-badge-designation">{designation}</span>
            <span className="profile-badge-dept">{department}</span>
          </div>

          <div className="profile-bio-box">
            <h3>Bio / Description</h3>
            {!isEditing ? (
              <p className="bio-text">
                {formData.bio || "No bio summary written yet. Click 'Edit Profile' to add a short bio about yourself!"}
              </p>
            ) : (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                maxLength={500}
                placeholder="Tell us about yourself (max 500 characters)..."
                className="bio-textarea"
              />
            )}
          </div>

          <div className="profile-social-box">
            <h3>Social & Links</h3>
            <div className="social-links-grid">
              {!isEditing ? (
                <>
                  {formData.linkedin && (
                    <a href={formData.linkedin.startsWith("http") ? formData.linkedin : `https://${formData.linkedin}`} target="_blank" rel="noopener noreferrer" className="social-link-btn linkedin">
                      <Link2 size={16} />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {formData.github && (
                    <a href={formData.github.startsWith("http") ? formData.github : `https://${formData.github}`} target="_blank" rel="noopener noreferrer" className="social-link-btn github">
                      <Code size={16} />
                      <span>GitHub</span>
                    </a>
                  )}
                  {formData.website && (
                    <a href={formData.website.startsWith("http") ? formData.website : `https://${formData.website}`} target="_blank" rel="noopener noreferrer" className="social-link-btn website">
                      <Globe size={16} />
                      <span>Website</span>
                    </a>
                  )}
                  {!formData.linkedin && !formData.github && !formData.website && (
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", width: "100%", textAlign: "center" }}>No links set.</p>
                  )}
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%" }}>
                  <div className="input-wrapper-social">
                    <Link2 size={15} style={{ color: "#0077b5" }} />
                    <input
                      type="text"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      placeholder="linkedin.com/in/username"
                    />
                  </div>
                  <div className="input-wrapper-social">
                    <Code size={15} style={{ color: "var(--text-primary)" }} />
                    <input
                      type="text"
                      name="github"
                      value={formData.github}
                      onChange={handleChange}
                      placeholder="github.com/username"
                    />
                  </div>
                  <div className="input-wrapper-social">
                    <Globe size={15} style={{ color: "var(--primary)" }} />
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="portfolio.com"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Right Details Pane */}
        <section className="profile-details-card glass-card">
          <div className="profile-details-tabs">
            <button className={`tab-btn ${activeTab === "personal" ? "active" : ""}`} onClick={() => setActiveTab("personal")}>
              <UserCheck size={16} />
              <span>Personal Info</span>
            </button>
            <button className={`tab-btn ${activeTab === "address" ? "active" : ""}`} onClick={() => setActiveTab("address")}>
              <MapPin size={16} />
              <span>Contact & Address</span>
            </button>
            <button className={`tab-btn ${activeTab === "emergency" ? "active" : ""}`} onClick={() => setActiveTab("emergency")}>
              <Heart size={16} />
              <span>Emergency Contact</span>
            </button>
            <button className={`tab-btn ${activeTab === "promotions" ? "active" : ""}`} onClick={() => setActiveTab("promotions")}>
              <TrendingUp size={16} />
              <span>Promotions</span>
            </button>
          </div>

          <div className="profile-tab-content">
            {activeTab === "personal" && (
              <div className="tab-pane animate-fade">
                <div className="details-section-title">
                  <User size={18} className="icon-title" />
                  <h3>Personal Information</h3>
                </div>
                
                <div className="details-grid">
                  {/* System records (Non-editable) */}
                  <div className="detail-item read-only">
                    <label>Employee ID</label>
                    <div className="value-box">
                      <Briefcase size={14} />
                      <span>{empId}</span>
                    </div>
                  </div>

                  <div className="detail-item read-only">
                    <label>System Role</label>
                    <div className="value-box">
                      <Layers size={14} />
                      <span>{user?.role || "Employee"}</span>
                    </div>
                  </div>

                  <div className="detail-item read-only">
                    <label>Joining Date</label>
                    <div className="value-box">
                      <Calendar size={14} />
                      <span>{joiningDate}</span>
                    </div>
                  </div>

                  <div className="detail-item read-only">
                    <label>Salary (INR)</label>
                    <div className="value-box">
                      <Building size={14} />
                      <span>{salary}</span>
                    </div>
                  </div>

                  {/* Profile record details */}
                  <div className="detail-item">
                    <label>Phone Number</label>
                    {!isEditing ? (
                      <div className="value-box">
                        <Phone size={14} />
                        <span>{formData.phone || "Not set"}</span>
                      </div>
                    ) : (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 XXXXX XXXXX"
                        className="form-control"
                      />
                    )}
                  </div>

                  <div className="detail-item">
                    <label>Date of Birth</label>
                    {!isEditing ? (
                      <div className="value-box">
                        <Calendar size={14} />
                        <span>{formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Not set"}</span>
                      </div>
                    ) : (
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="form-control"
                      />
                    )}
                  </div>

                  <div className="detail-item">
                    <label>Gender</label>
                    {!isEditing ? (
                      <div className="value-box">
                        <User size={14} />
                        <span>{formData.gender}</span>
                      </div>
                    ) : (
                      <select name="gender" value={formData.gender} onChange={handleChange} className="form-control">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    )}
                  </div>

                  <div className="detail-item">
                    <label>Marital Status</label>
                    {!isEditing ? (
                      <div className="value-box">
                        <User size={14} />
                        <span>{formData.maritalStatus}</span>
                      </div>
                    ) : (
                      <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="form-control">
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    )}
                  </div>

                  <div className="detail-item">
                    <label>Blood Group</label>
                    {!isEditing ? (
                      <div className="value-box">
                        <Heart size={14} />
                        <span>{formData.bloodGroup}</span>
                      </div>
                    ) : (
                      <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="form-control">
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    )}
                  </div>

                  <div className="detail-item">
                    <label>Nationality</label>
                    {!isEditing ? (
                      <div className="value-box">
                        <Flag size={14} />
                        <span>{formData.nationality || "Not set"}</span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        placeholder="e.g. Indian"
                        className="form-control"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "address" && (
              <div className="tab-pane animate-fade">
                <div className="details-section-title">
                  <MapPin size={18} className="icon-title" />
                  <h3>Contact & Residential Info</h3>
                </div>

                <div className="details-grid">
                  <div className="detail-item read-only">
                    <label>Corporate Email</label>
                    <div className="value-box">
                      <Mail size={14} />
                      <span>{email}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <label>Street Address</label>
                    {!isEditing ? (
                      <div className="value-box">
                        <MapPin size={14} />
                        <span>{formData.address || "Not set"}</span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Room/Flat No., Building Name, Street"
                        className="form-control"
                      />
                    )}
                  </div>

                  <div className="detail-item">
                    <label>City</label>
                    {!isEditing ? (
                      <div className="value-box">
                        <MapPin size={14} />
                        <span>{formData.city || "Not set"}</span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City name"
                        className="form-control"
                      />
                    )}
                  </div>

                  <div className="detail-item">
                    <label>State / Province</label>
                    {!isEditing ? (
                      <div className="value-box">
                        <MapPin size={14} />
                        <span>{formData.state || "Not set"}</span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="State name"
                        className="form-control"
                      />
                    )}
                  </div>

                  <div className="detail-item">
                    <label>Country</label>
                    {!isEditing ? (
                      <div className="value-box">
                        <Flag size={14} />
                        <span>{formData.country || "Not set"}</span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="Country name"
                        className="form-control"
                      />
                    )}
                  </div>

                  <div className="detail-item">
                    <label>Zip / Postal Code</label>
                    {!isEditing ? (
                      <div className="value-box">
                        <MapPin size={14} />
                        <span>{formData.zipCode || "Not set"}</span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        placeholder="Zip Code"
                        className="form-control"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "emergency" && (
              <div className="tab-pane animate-fade">
                <div className="details-section-title">
                  <Heart size={18} className="icon-title" />
                  <h3>Emergency Contact Details</h3>
                </div>

                <div className="details-grid">
                  <div className="detail-item">
                    <label>Contact Person Name</label>
                    {!isEditing ? (
                      <div className="value-box">
                        <User size={14} />
                        <span>{formData.emergencyContact.name || "Not set"}</span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="emergencyContact.name"
                        value={formData.emergencyContact.name}
                        onChange={handleChange}
                        placeholder="Full Name"
                        className="form-control"
                      />
                    )}
                  </div>

                  <div className="detail-item">
                    <label>Relationship</label>
                    {!isEditing ? (
                      <div className="value-box">
                        <Layers size={14} />
                        <span>{formData.emergencyContact.relationship || "Not set"}</span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="emergencyContact.relationship"
                        value={formData.emergencyContact.relationship}
                        onChange={handleChange}
                        placeholder="e.g. Spouse, Parent, Sibling"
                        className="form-control"
                      />
                    )}
                  </div>

                  <div className="detail-item">
                    <label>Emergency Contact Phone</label>
                    {!isEditing ? (
                      <div className="value-box">
                        <Phone size={14} />
                        <span>{formData.emergencyContact.phone || "Not set"}</span>
                      </div>
                    ) : (
                      <input
                        type="tel"
                        name="emergencyContact.phone"
                        value={formData.emergencyContact.phone}
                        onChange={handleChange}
                        placeholder="Phone Number"
                        className="form-control"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "promotions" && (
              <div className="tab-pane animate-fade">
                <div className="details-section-title">
                  <TrendingUp size={18} className="icon-title" />
                  <h3>Promotion & Career Milestones</h3>
                </div>

                {promotions.length === 0 ? (
                  <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    <p style={{ fontSize: "0.9rem" }}>No promotion events logged in your profile history yet.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1rem" }}>
                    {promotions.map((promo) => (
                      <div key={promo._id} className="timeline-item" style={{
                        background: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-lg)",
                        padding: "1.25rem",
                        position: "relative"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                          <h4 style={{ color: "var(--text-primary)", fontWeight: "600", fontSize: "0.95rem", margin: 0 }}>
                            {promo.promotionTitle}
                          </h4>
                          <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: "600" }}>
                            {new Date(promo.effectiveDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", fontSize: "0.85rem" }}>
                          <div>
                            <span style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "0.25rem" }}>Designation Upgrade</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <span style={{ textDecoration: "line-through", opacity: 0.6 }}>{promo.previousDesignation}</span>
                              <ArrowRight size={12} style={{ opacity: 0.5 }} />
                              <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{promo.newDesignation}</span>
                            </div>
                          </div>

                          <div>
                            <span style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "0.25rem" }}>Department Change</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <span style={{ textDecoration: "line-through", opacity: 0.6 }}>{promo.previousDepartment}</span>
                              <ArrowRight size={12} style={{ opacity: 0.5 }} />
                              <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{promo.newDepartment}</span>
                            </div>
                          </div>

                          <div>
                            <span style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "0.25rem" }}>Salary Increase</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <span style={{ textDecoration: "line-through", opacity: 0.6 }}>₹{(promo.previousSalary || 0).toLocaleString("en-IN")}</span>
                              <ArrowRight size={12} style={{ opacity: 0.5 }} />
                              <span style={{ fontWeight: "600", color: "var(--success)" }}>₹{promo.newSalary.toLocaleString("en-IN")}</span>
                            </div>
                          </div>
                        </div>

                        {(promo.reason || promo.remarks) && (
                          <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-color)", fontSize: "0.85rem" }}>
                            {promo.reason && (
                              <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0" }}>
                                <strong>Reason:</strong> {promo.reason}
                              </p>
                            )}
                            {promo.remarks && (
                              <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0" }}>
                                <strong>Remarks:</strong> {promo.remarks}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
