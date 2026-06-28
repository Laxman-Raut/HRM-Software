import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import EmployeeAttendanceView from "../components/Attendance/EmployeeAttendanceView";
import AdminAttendanceView from "../components/Attendance/AdminAttendanceView";
import ManualAttendanceModal from "../components/Attendance/ManualAttendanceModal";
import "./AttendancePage.css";

const API_BASE_URL = "http://localhost:5000/api/attendance";

export default function AttendancePage({ user, employees }) {
  const isAdmin = user && user.role !== "Employee";
  
  // Clock state
  const [time, setTime] = useState(new Date());
  
  // Data states
  const [todayStatus, setTodayStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    totalActiveEmployees: 0,
    presentToday: 0,
    halfDayToday: 0,
    absentToday: 0,
    checkedInToday: 0,
    totalDays: 0,
    present: 0,
    halfDay: 0,
    absent: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Admin filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Manual check-in modal state
  const [showModal, setShowModal] = useState(false);
  const [modalEmployeeId, setModalEmployeeId] = useState("");
  const [modalType, setModalType] = useState("in"); // "in" or "out"

  // Tick clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load stats and history
  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Load Stats
      const statsRes = await fetch(`${API_BASE_URL}/stats`, { headers });
      const statsJson = await statsRes.json();
      if (statsJson.success) {
        setStats(statsJson.data);
      }

      // Load History logs
      const historyRes = await fetch(`${API_BASE_URL}/history`, { headers });
      const historyJson = await historyRes.json();
      if (historyJson.success) {
        setHistory(historyJson.data || []);
      }

      // Load Employee Today's Status
      if (!isAdmin) {
        const todayRes = await fetch(`${API_BASE_URL}/today-status`, { headers });
        const todayJson = await todayRes.json();
        if (todayJson.success) {
          setTodayStatus(todayJson.data);
        }
      }
    } catch (err) {
      console.error("Error loading attendance data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const showMessage = (msg, type = "success") => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(null), 5000);
  };

  // Perform Check In
  const handleCheckIn = async (empId = null) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const body = empId ? JSON.stringify({ employeeId: empId }) : JSON.stringify({});
      const response = await fetch(`${API_BASE_URL}/check-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body
      });
      const data = await response.json();
      if (response.ok && data.success) {
        showMessage(data.message || "Checked In Successfully", "success");
        loadData();
      } else {
        showMessage(data.message || "Failed to Check In", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("Connection failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Perform Check Out
  const handleCheckOut = async (empId = null) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const body = empId ? JSON.stringify({ employeeId: empId }) : JSON.stringify({});
      const response = await fetch(`${API_BASE_URL}/check-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body
      });
      const data = await response.json();
      if (response.ok && data.success) {
        showMessage(data.message || "Checked Out Successfully", "success");
        loadData();
      } else {
        showMessage(data.message || "Failed to Check Out", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("Connection failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Manual Admin clock in/out
  const handleManualAction = async (e) => {
    e.preventDefault();
    if (!modalEmployeeId) return;
    
    setShowModal(false);
    if (modalType === "in") {
      await handleCheckIn(modalEmployeeId);
    } else {
      await handleCheckOut(modalEmployeeId);
    }
    setModalEmployeeId("");
  };

  return (
    <div className="attendance-container fade-in">
      {/* Toast Alert Message */}
      {message && (
        <div 
          className={`badge badge-${message.type === "success" ? "active" : "inactive"}`}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 1200,
            padding: "1rem 1.5rem",
            fontSize: "0.9rem",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Title block */}
      <div style={{ marginBottom: "0.5rem" }}>
        <h1 className="page-title" style={{ fontFamily: "var(--font-heading)" }}>
          Attendance Tracking
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          {isAdmin 
            ? "Monitor daily logs and employee schedules" 
            : "Register your clock-in / clock-out times and log your shifts"}
        </p>
      </div>

      {!isAdmin ? (
        /* ================== EMPLOYEE ROLE ================== */
        <EmployeeAttendanceView
          time={time}
          todayStatus={todayStatus}
          submitting={submitting}
          handleCheckIn={handleCheckIn}
          handleCheckOut={handleCheckOut}
          stats={stats}
          history={history}
        />
      ) : (
        /* ================== ADMIN ROLE ================== */
        <AdminAttendanceView
          stats={stats}
          history={history}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedDept={selectedDept}
          setSelectedDept={setSelectedDept}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          setShowModal={setShowModal}
        />
      )}

      {/* Manual Check-in / Out Modal Dialog */}
      <ManualAttendanceModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setModalEmployeeId(""); }}
        onSubmit={handleManualAction}
        employees={employees}
        employeeId={modalEmployeeId}
        setEmployeeId={setModalEmployeeId}
        actionType={modalType}
        setActionType={setModalType}
      />
    </div>
  );
}
