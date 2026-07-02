import Announcement from "../models/Announcement.js";
import Employee from "../models/Employee.js";
import sendEmail from "../utils/sendEmail.js";
import announcementEmail from "../templates/announcement/announcementEmail.js";

// Create Announcement
export const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      description,
      targetAudience,
      priority,
      expiryDate,
    } = req.body;

    const creatorName = req.user.name || (req.user.firstName + " " + (req.user.lastName || ""));

    const announcement = await Announcement.create({
      title,
      description,
      createdBy: creatorName,
      createdByRole: req.user.role,
      targetAudience,
      priority,
      expiryDate,
    });

    // 📧 SMTP EMAIL LOGIC - Run in background to avoid blocking API response
    (async () => {
      try {
        const employees = await Employee.find({
          email: { $exists: true },
        });

        const emailPromises = [];
        for (const emp of employees) {
          if (!emp.email) continue;

          // send email only to relevant audience
          if (
            targetAudience !== "ALL" &&
            targetAudience !== emp.role
          ) continue;

          emailPromises.push(
            sendEmail({
              to: emp.email,
              subject: ` New Announcement - ${priority || "INFO"}`,
              html: announcementEmail(announcement),
            }).catch((err) => {
              console.error(` Failed to send announcement email to ${emp.email}:`, err.message);
            })
          );
        }

        await Promise.all(emailPromises);
        console.log(" Announcement emails sent successfully");
      } catch (emailError) {
        console.error(" Announcement Email Error:", emailError.message);
      }
    })();

    return res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: announcement,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Announcements
export const getAnnouncements = async (req, res) => {
  try {
    let query = {};

    // Employees should only see active, non-expired announcements targeted to them or ALL
    if (req.user.role === "Employee") {
      query = {
        targetAudience: { $in: ["ALL", "Employee"] },
        isActive: true,
        $or: [
          { expiryDate: null },
          { expiryDate: { $gt: new Date() } }
        ]
      };
    }

    const announcements = await Announcement.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};