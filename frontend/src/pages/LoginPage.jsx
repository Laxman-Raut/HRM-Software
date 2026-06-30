import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Mail, Users, AlertCircle, Loader2 } from "lucide-react";

import { BASE_URL } from "../config";

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid credentials.");
      }

      // Store Token & User metadata
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLoginSuccess(data.user);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to log in. Please check your connection.");
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
          <h1 className="login-title">HRM Portal</h1>
          <p className="login-subtitle">Sign in to manage employees & metrics</p>
        </div>

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
                placeholder="admin@hrm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ color: "var(--primary)", textDecoration: "none", fontSize: "0.75rem", fontWeight: "650" }}>
                Forgot Password?
              </Link>
            </div>
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

          <button type="submit" className="btn btn-primary login-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="spinner" size={16} />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="login-footer">
          <span>Default Demo Account:</span>
          <strong>admin@hrm.com / admin123</strong>
        </div>
      </div>
    </div>
  );
}
