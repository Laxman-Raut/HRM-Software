import emailLayout from "../layouts/emailLayout.js";

const leaveRejectedEmail = (leave, remark = "") => {

  const content = `

    <p style="font-size:16px;color:#374151;">
      Hello <strong>${leave.employee.firstName}</strong>,
    </p>

    <p style="font-size:15px;color:#4b5563;line-height:24px;">
      We regret to inform you that your leave request has been
      <strong style="color:#dc2626;">rejected</strong>.
    </p>

    <table
      width="100%"
      cellpadding="10"
      cellspacing="0"
      style="
        margin-top:25px;
        border:1px solid #e5e7eb;
        border-collapse:collapse;
      ">

      <tr style="background:#f9fafb;">
        <td><strong>Leave Type</strong></td>
        <td>${leave.leaveType || "-"}</td>
      </tr>

      <tr>
        <td><strong>From Date</strong></td>
        <td>${new Date(leave.startDate).toLocaleDateString()}</td>
      </tr>

      <tr style="background:#f9fafb;">
        <td><strong>To Date</strong></td>
        <td>${new Date(leave.endDate).toLocaleDateString()}</td>
      </tr>

      <tr>
        <td><strong>Status</strong></td>
        <td style="color:#dc2626;font-weight:bold;">
          Rejected
        </td>
      </tr>

      ${
        remark
          ? `
      <tr style="background:#f9fafb;">
        <td><strong>HR Remark</strong></td>
        <td>${remark}</td>
      </tr>
      `
          : ""
      }

    </table>

    <div
      style="
        margin-top:30px;
        padding:18px;
        background:#fef2f2;
        border-left:5px solid #dc2626;
      ">

      <strong>Notice</strong>

      <p style="margin-top:10px;line-height:24px;color:#444;">
        If you have any questions regarding this decision,
        please contact the HR Department for further clarification.
      </p>

    </div>

    <p style="margin-top:35px;">
      Regards,<br>
      <strong>HR Department</strong>
    </p>

  `;

  return emailLayout("❌ Leave Request Rejected", content);
};

export default leaveRejectedEmail;