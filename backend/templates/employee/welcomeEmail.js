import emailLayout from "../layouts/emailLayout.js";

const welcomeEmail = (employee, temporaryPassword = "") => {

  const content = `

<p style="
font-size:17px;
color:#374151;
line-height:28px;
">

Hello <strong>${employee.firstName} ${employee.lastName || ""}</strong>,

</p>

<p style="
font-size:16px;
line-height:30px;
color:#4b5563;
">

🎉 Congratulations and welcome to the team!

Your employee account has been successfully created in the
<strong>HRM System</strong>.

We are excited to have you with us and wish you a successful journey ahead.

</p>

<div
style="
margin-top:35px;
background:#f8fafc;
border:1px solid #e5e7eb;
border-radius:12px;
padding:25px;
">

<h3 style="
margin-top:0;
color:#111827;
">

Employee Information

</h3>

<table
width="100%"
cellpadding="8"
cellspacing="0"
style="font-size:15px;">

<tr>

<td width="35%">
<strong>Employee ID</strong>
</td>

<td>
${employee.employeeId || "-"}
</td>

</tr>

<tr>

<td>
<strong>Name</strong>
</td>

<td>
${employee.firstName} ${employee.lastName || ""}
</td>

</tr>

<tr>

<td>
<strong>Email</strong>
</td>

<td>
${employee.email}
</td>

</tr>

<tr>

<td>
<strong>Department</strong>
</td>

<td>
${employee.department || "-"}
</td>

</tr>

<tr>

<td>
<strong>Designation</strong>
</td>

<td>
${employee.designation || "-"}
</td>

</tr>

${
temporaryPassword
?
`
<tr>

<td>
<strong>Temporary Password</strong>
</td>

<td>

<span
style="
background:#111827;
color:white;
padding:6px 12px;
border-radius:6px;
font-weight:bold;
">

${temporaryPassword}

</span>

</td>

</tr>
`
:
""
}

</table>

</div>

<div
style="
margin-top:30px;
padding:22px;
background:#ecfeff;
border-left:5px solid #0891b2;
border-radius:8px;
">

<h3 style="margin-top:0;">

Your Next Steps

</h3>

<ul style="
line-height:32px;
padding-left:20px;
color:#374151;
">

<li>Login to the HRM Portal.</li>

<li>Change your temporary password.</li>

<li>Complete your employee profile.</li>

<li>Upload all required documents.</li>

<li>Verify your bank details.</li>

</ul>

</div>

<div
style="
margin-top:35px;
text-align:center;
">

<a
href="http://localhost:5173/login"

style="
display:inline-block;
background:#2563eb;
color:white;
padding:15px 35px;
text-decoration:none;
font-size:16px;
font-weight:bold;
border-radius:8px;
">

Login to HRM Portal

</a>

</div>

<div
style="
margin-top:45px;
padding:20px;
background:#fefce8;
border-radius:10px;
border-left:5px solid #f59e0b;
">

<strong>Security Reminder</strong>

<p style="
margin-top:12px;
line-height:28px;
color:#4b5563;
">

For your security, please change your password immediately after your first login.

Never share your login credentials with anyone.

</p>

</div>

<p
style="
margin-top:45px;
font-size:16px;
line-height:30px;
color:#374151;
">

We look forward to working with you.

Welcome aboard! 🚀

</p>

<p style="
margin-top:35px;
">

Regards,

<br><br>

<strong>Human Resources Department</strong>

</p>

`;

  return emailLayout("🎉 Welcome to HRM System", content);

};

export default welcomeEmail;