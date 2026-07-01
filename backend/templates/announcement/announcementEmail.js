import emailLayout from "../layouts/emailLayout.js";

const announcementEmail = (announcement) => {
  const content = `
    <h2 style="color:#1f2937;">📢 ${announcement.title || "Company Announcement"}</h2>

    <p style="font-size:16px;color:#374151;line-height:26px;">
      ${announcement.description || ""}
    </p>

    <div style="
      margin-top:20px;
      padding:15px;
      border-left:5px solid #3b82f6;
      background:#eff6ff;
      border-radius:6px;
    ">
      <p style="margin:0;"><strong>Priority:</strong> ${announcement.priority || "Medium"}</p>
      <p style="margin:0;"><strong>Posted By:</strong> ${announcement.createdBy || "HR Department"}</p>
      <p style="margin:0;"><strong>Date:</strong> ${new Date(announcement.createdAt || Date.now()).toLocaleDateString()}</p>
    </div>

    <p style="margin-top:25px;color:#374151;">
      Regards,<br/>
      <strong>HR Department</strong>
    </p>
  `;

  return emailLayout("📢 New Announcement", content);
};

export default announcementEmail;