const emailLayout = (title, content) => {
  return `
<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>${title}</title>

</head>

<body style="
margin:0;
padding:0;
background:#f3f6fb;
font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f6fb;padding:40px 15px;">

<tr>

<td align="center">

<table width="650" cellpadding="0" cellspacing="0"
style="
background:#ffffff;
border-radius:18px;
overflow:hidden;
box-shadow:0 10px 40px rgba(0,0,0,.08);
">

<!-- HEADER -->

<tr>

<td
style="
background:linear-gradient(135deg,#2563eb,#4f46e5);
padding:45px;
text-align:center;
">

<div
style="
width:80px;
height:80px;
background:white;
border-radius:50%;
margin:auto;
line-height:80px;
font-size:34px;
">

🏢

</div>

<h1
style="
color:white;
margin-top:20px;
margin-bottom:8px;
font-size:30px;
">

HRM SYSTEM

</h1>

<p
style="
color:#dbeafe;
margin:0;
font-size:16px;
">

Smart Employee Management Platform

</p>

</td>

</tr>

<!-- BODY -->

<tr>

<td style="padding:45px;">

<h2
style="
margin-top:0;
color:#111827;
font-size:28px;
">

${title}

</h2>

${content}

</td>

</tr>

<!-- SUPPORT SECTION -->

<tr>

<td
style="
padding:35px;
background:#f8fafc;
border-top:1px solid #e5e7eb;
">

<h3
style="
margin-top:0;
color:#111827;
">

Need Help?

</h3>

<p
style="
margin:8px 0;
color:#4b5563;
line-height:26px;
">

If you have any questions, please contact our HR Team.

</p>

<p style="margin:0;color:#2563eb;">

📧 hr@yourcompany.com

</p>

<p style="margin-top:8px;color:#2563eb;">

📞 +91 XXXXX XXXXX

</p>

</td>

</tr>

<!-- FOOTER -->

<tr>

<td
style="
background:#111827;
padding:30px;
text-align:center;
">

<p
style="
margin:0;
color:white;
font-size:18px;
font-weight:bold;
">

HRM System

</p>

<p
style="
margin-top:10px;
color:#9ca3af;
line-height:24px;
">

This is an automated email.

Please do not reply to this message.

</p>

<p
style="
margin-top:25px;
color:#6b7280;
font-size:13px;
">

© 2026 HRM System. All Rights Reserved.

</p>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
`;
};

export default emailLayout;