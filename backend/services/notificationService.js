import Notification from "../models/Notification.js";

export const createNotification = async ({
  title,
  message,
  type = "INFO",
  forRole = "ALL",
}) => {
  return await Notification.create({
    title,
    message,
    type,
    forRole,
  });
};