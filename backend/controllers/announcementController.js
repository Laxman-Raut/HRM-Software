import Announcement from "../models/Announcement.js";

export const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      description,
      targetAudience,
      priority,
      expiryDate,
    } = req.body;

    const announcement = await Announcement.create({
      title,
      description,
      createdBy: req.user.firstName + " " + req.user.lastName,
      createdByRole: req.user.role,
      targetAudience,
      priority,
      expiryDate,
    });

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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