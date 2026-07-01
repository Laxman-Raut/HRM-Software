import emailLayout from "../layouts/emailLayout.js";

const warningEmail = (employee, warning) => {
  const content = `
  
  <p style="font-size:16px;color:#374151;line-height:28px;">
    Hello <strong>${employee.firstName} ${employee.lastName || ""}</strong>,
  </p>

  <p style="font-size:16px;line-height:28px;color:#4b5563;">
    This is an official notification regarding your performance/behavior.
  </p>

  <div style="
    margin-top:20px;
    padding:20px;
    background:#fff1f2;
    border-left:5px solid #ef4444;
    border-radius:8px;
  ">
    <h3 style="margin:0;color:#b91c1c;">⚠️ Warning Notice</h3>

    <p style="margin-top:10px;color:#374151;line-height:26px;">
      <strong>Reason:</strong> ${warning.reason}
    </p>

    <p style="color:#374151;line-height:26px;">
      <strong>Severity:</strong> ${warning.severity || "Medium"}
    </p>

    <p style="color:#374151;line-height:26px;">
      <strong>Date:</strong> ${new Date().toLocaleDateString()}
    </p>
  </div>

  <div style="
    margin-top:20px;
    padding:15px;
    background:#fefce8;
    border-left:5px solid #facc15;
  ">
    <p style="margin:0;color:#4b5563;line-height:26px;">
      Please take this warning seriously. Repeated issues may lead to further disciplinary action.
    </p>
  </div>

  <p style="margin-top:25px;color:#374151;">
    If you have any questions, please contact HR.
  </p>

  <p style="margin-top:30px;">
    Regards,<br>
    <strong>Human Resources Department</strong>
  </p>

  `;

  return emailLayout("⚠️ Warning Notice - HRM System", content);
};

export default warningEmail;