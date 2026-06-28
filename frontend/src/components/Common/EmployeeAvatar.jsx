import React, { useState } from "react";

export default function EmployeeAvatar({ emp, className = "employee-avatar", style }) {
  const [imgError, setImgError] = useState(false);
  
  if (!emp) {
    return <div className={`${className} initials-avatar`} style={style}>??</div>;
  }
  
  const first = emp.firstName ? emp.firstName.charAt(0).toUpperCase() : "";
  const last = emp.lastName ? emp.lastName.charAt(0).toUpperCase() : "";
  const initials = first + last || "?";

  if (emp.profilePhoto && emp.profilePhoto.trim() !== "" && !imgError) {
    return (
      <img
        src={emp.profilePhoto}
        alt={`${emp.firstName} ${emp.lastName}`}
        className={className}
        style={style}
        onError={() => setImgError(true)}
      />
    );
  }
  return <div className={`${className} initials-avatar`} style={style}>{initials}</div>;
}
