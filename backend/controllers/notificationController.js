import Notification from "../models/Notification.js";

// Get notifications
export const getNotifications = async (req, res) => {
  try {
    const { role } = req.user;

    // Admin and HR roles should see each other's administrative notifications
    const allowedRoles = [role, "ALL"];
    if (role === "Admin") {
      allowedRoles.push("HR");
    } else if (role === "HR") {
      allowedRoles.push("Admin");
    }

    const notifications = await Notification.find({
      forRole: { $in: allowedRoles },
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark as read
export const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      isRead: true,
    });

    res.json({ success: true, message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};