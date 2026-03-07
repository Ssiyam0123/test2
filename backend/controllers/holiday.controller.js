import Holiday from "../models/holiday.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

// Get all holidays
export const getHolidays = catchAsync(async (req, res) => {
  const holidays = await Holiday.find().sort({ date_string: 1 }).lean();
  res.status(200).json({ success: true, data: holidays });
});

// Add a new holiday
export const addHoliday = catchAsync(async (req, res) => {
  const { title, date_string } = req.body;
  
  const existing = await Holiday.findOne({ date_string });
  if (existing) throw new AppError("A holiday with this date already exists.", 400);

  const holiday = await Holiday.create({ title, date_string });
  res.status(201).json({ success: true, data: holiday, message: "Holiday added successfully" });
});

// Delete a holiday
export const deleteHoliday = catchAsync(async (req, res) => {
  const holiday = await Holiday.findByIdAndDelete(req.params.id);
  if (!holiday) throw new AppError("Holiday not found", 404);
  
  res.status(200).json({ success: true, message: "Holiday removed successfully" });
});