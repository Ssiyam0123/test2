import MasterSyllabus from "../models/masterSyllabus.js";
import AppError from "../utils/AppError.js";

export const insertTopics = async (data) => {
  const payload = Array.isArray(data) ? data : [data];
  
  if (!payload.length) throw new AppError("Topic data is required", 400);

  return await MasterSyllabus.insertMany(payload);
};

export const fetchAllTopics = async (category, search) => {
  let filter = {};

  if (category) filter.category = category;
  if (search) filter.topic = { $regex: search, $options: "i" };

  return await MasterSyllabus.find(filter)
    .sort({ category: 1, order_index: 1, topic: 1 })
    .lean(); 
};

export const fetchTopicById = async (id) => {
  const topic = await MasterSyllabus.findById(id).lean();
  if (!topic) throw new AppError("Topic not found in library", 404);
  return topic;
};

export const modifyTopic = async (id, updateData) => {
  const updatedTopic = await MasterSyllabus.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updatedTopic) throw new AppError("Topic not found", 404);
  return updatedTopic;
};

export const removeTopic = async (id) => {
  const deletedTopic = await MasterSyllabus.findByIdAndDelete(id);
  if (!deletedTopic) throw new AppError("Topic not found", 404);
  return deletedTopic;
};