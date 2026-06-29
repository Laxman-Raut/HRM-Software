import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Users, AlertCircle, Loader2, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Something went wrong. Please try again.");
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to submit request. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container fade-in">
      <div className="login-card glass-card">
        <div className="login-header">
          <div className="login-logo-icon">
            <Users size={28} />
          </div>
          <h1 className="login-title">Forgot Password</h1>
          <p className="login-subtitle">Enter your email to receive a password reset link</p>
        </div>

        {success ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "1.5rem" }}>
            <div style={{ color: "var(--success)" }}>
              <CheckCircle size={48} />
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.5" }}>
              A password reset link has been sent to <strong>{email}</strong>. Please check your inbox and follow the instructions to reset your password.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: "100%", textDecoration: "none", color: "white" }}>
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="badge badge-inactive login-error-badge">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="login-input-wrapper">
                <Mail size={16} className="login-input-icon" />
                <input
                  type="email"
                  className="form-control login-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary login-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="spinner" size={16} />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)", textDecoration: "none", fontSize: "0.85rem", fontWeight: "600" }}>
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
