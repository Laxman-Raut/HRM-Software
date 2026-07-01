import emailLayout from "../layouts/emailLayout.js";
const leaveApprovedEmail = (leave) => {
  const content = `
    
    <p style="font-size:16px;color:#374151;">
      Hello <strong>${leave.employee.firstName}</strong>,
    </p>

    <p style="font-size:15px;color:#4b5563;line-height:24px;">
      We are pleased to inform you that your leave request has been
      <strong style="color:#16a34a;">approved</strong>.
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
        <td style="color:#16a34a;font-weight:bold;">
          Approved
        </td>
      </tr>

    </table>

    <div
      style="
        margin-top:30px;
        padding:18px;
        background:#ecfdf5;
        border-left:5px solid #22c55e;
      ">

      <strong>Congratulations! 🎉</strong>

      <p style="margin-top:10px;line-height:24px;color:#444;">
        Your leave request has been approved successfully.
        Please coordinate with your reporting manager before your leave starts.
      </p>

    </div>

    <p style="margin-top:35px;">
      Regards,<br>
      <strong>HR Department</strong>
    </p>

  `;

  return emailLayout(" Leave Request Approved", content);
};

export default leaveApprovedEmail;