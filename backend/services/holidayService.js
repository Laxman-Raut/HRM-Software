import Holiday from "../models/Holiday.js";

// Create Holiday
export const createHolidayService = async (holidayData) => {
  const { title, date, type, description } = holidayData;

  // Check if holiday already exists on same date
  const holidayExists = await Holiday.findOne({
    title,
    date,
  });

  if (holidayExists) {
    throw new Error("Holiday already exists");
  }

  // Create Holiday
  const holiday = await Holiday.create({
    title,
    date,
    type,
    description,
  });

  return holiday;
};