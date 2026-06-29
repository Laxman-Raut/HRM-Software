import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Lock, Users, AlertCircle, Loader2, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid or expired reset token.");
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to reset password. Please check your connection.");
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
          <h1 className="login-title">Reset Password</h1>
          <p className="login-subtitle">Enter your new password below</p>
        </div>

        {success ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "1.5rem" }}>
            <div style={{ color: "var(--success)" }}>
              <CheckCircle size={48} />
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.5" }}>
              Your password has been successfully reset! You can now sign in with your new credentials.
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
              <label className="form-label">New Password</label>
              <div className="login-input-wrapper">
                <Lock size={16} className="login-input-icon" />
                <input
                  type="password"
                  className="form-control login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="login-input-wrapper">
                <Lock size={16} className="login-input-icon" />
                <input
                  type="password"
                  className="form-control login-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary login-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="spinner" size={16} />
                  <span>Resetting Password...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
