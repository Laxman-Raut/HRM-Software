import Promotion from "../models/Promotion.js";
import { createPromotionService } from "../services/promotionService.js";
import { createNotification } from "../services/notificationService.js";
import sendEmail from "../utils/sendEmail.js";
import promotionEmail from "../templates/promotion/promotionEmail.js";

export const createPromotion = async (req, res) => {
  try {
    const promotion = await createPromotionService(
      req.params.employeeId,
      req.body,
      req.user
    );

    // Notification
    try {
      await createNotification({
        title: "Congratulations! 🎉",
        message: `You have been promoted to ${promotion.newDesignation}.`,
        type: "SUCCESS",
        forRole: "Employee",
      });
    } catch (err) {
      console.error("Notification Error:", err.message);
    }

    // Email
    try {
      await sendEmail({
        to: promotion.employee.email,
        subject: " Congratulations on Your Promotion",
        html: promotionEmail(promotion),
      });
    } catch (err) {
      console.error("Promotion Email Error:", err.message);
    }

    res.status(201).json({
      success: true,
      message: "Employee promoted successfully.",
      data: promotion,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find()
      .populate(
        "employee",
        "firstName lastName employeeId email designation department"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: promotions.length,
      data: promotions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEmployeePromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find({
      employee: req.params.employeeId,
    }).sort({
      effectiveDate: -1,
    });

    res.status(200).json({
      success: true,
      count: promotions.length,
      data: promotions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Promotion deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};