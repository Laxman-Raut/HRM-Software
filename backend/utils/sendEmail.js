import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Setting from "../models/Setting.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables before transporter initialization
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Async SMTP verify on server start
const verifySMTPOnStart = async () => {
  try {
    const settings = await Setting.findOne();
    let host = process.env.EMAIL_HOST || "smtp.gmail.com";
    let port = Number(process.env.EMAIL_PORT || 587);
    let user = process.env.EMAIL_USER?.trim();
    let pass = process.env.EMAIL_PASS?.replace(/\s/g, "");

    if (settings && settings.smtpHost && settings.smtpUser && settings.smtpPass) {
      host = settings.smtpHost;
      port = Number(settings.smtpPort || 587);
      user = settings.smtpUser.trim();
      pass = settings.smtpPass.replace(/\s/g, "");
    }

    if (!user || !pass) {
      console.warn("⚠️ SMTP credentials are not configured in settings or .env");
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });

    transporter.verify((error) => {
      if (error) {
        console.error("❌ SMTP Connection Failed:", error.message);
      } else {
        console.log("✅ SMTP Ready to send emails");
      }
    });
  } catch (err) {
    console.error("❌ Failed to verify SMTP on start:", err.message);
  }
};

// Run verification after DB connection resolves
setTimeout(verifySMTPOnStart, 2000);

// 📧 Send Email Function
const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!to || !subject || !html) {
      throw new Error("Missing email fields: to, subject, html");
    }

    const settings = await Setting.findOne();
    let host = process.env.EMAIL_HOST || "smtp.gmail.com";
    let port = Number(process.env.EMAIL_PORT || 587);
    let user = process.env.EMAIL_USER?.trim();
    let pass = process.env.EMAIL_PASS?.replace(/\s/g, "");

    if (settings && settings.smtpHost && settings.smtpUser && settings.smtpPass) {
      host = settings.smtpHost;
      port = Number(settings.smtpPort || 587);
      user = settings.smtpUser.trim();
      pass = settings.smtpPass.replace(/\s/g, "");
    }

    if (!user || !pass) {
      throw new Error("SMTP credentials are not configured");
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });

    const info = await transporter.sendMail({
      from: `"HRM System" <${user}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully:", info.messageId);

    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw error;
  }
};

export default sendEmail;