import Batch from "../models/batch.js";
import ClassContent from "../models/classContent.js";
import { addDays, isSameDay, format,startOfDay } from "date-fns";

// 1. Create a Batch
export const createBatch = async (req, res) => {
  try {
    // req.body is completely formatted by processBatchPayload middleware
    const newBatch = await Batch.create(req.body);
    res.status(201).json({ success: true, data: newBatch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Update Batch Info
export const updateBatch = async (req, res) => {
  try {
    const updatedBatch = await Batch.findByIdAndUpdate(
      req.params.id, 
      req.body, // Completely formatted by middleware
      { new: true, runValidators: true }
    ).populate("course", "course_name");
    
    if (!updatedBatch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }
    
    res.status(200).json({ success: true, data: updatedBatch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get All Batches
// ২. Get All Batches with Status Filtering
export const getAllBatches = async (req, res) => {
  try {
    const { status } = req.query; // Query parameter হিসেবে status গ্রহণ করা
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const batches = await Batch.find(query)
      .populate("course", "course_name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: batches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get Classes for a specific Batch
export const getBatchClasses = async (req, res) => {
  try {
    const classes = await ClassContent.find({ batch: req.params.batchId }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// Delete a specific class from a batch
export const deleteClassContent = async (req, res) => {
  try {
    const { classId } = req.params;

    // ১. ক্লাসটি খুঁজে বের করা
    const classToDelete = await ClassContent.findById(classId);
    if (!classToDelete) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    // ২. ব্যাচ মডেল থেকে এই ক্লাসের আইডিটি সরিয়ে দেওয়া ($pull)
    await Batch.findByIdAndUpdate(classToDelete.batch, {
      $pull: { class_contents: classId }
    });

    // ৩. ক্লাস কালেকশন থেকে ডিলিট করা
    await ClassContent.findByIdAndDelete(classId);

    res.status(200).json({ success: true, message: "Class deleted and batch updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addClassToSyllabus = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const classesData = Array.isArray(req.body) ? req.body : [req.body];

    const formattedClasses = classesData.map(cls => {
      // THE FIX: Safely extract just the numbers from strings like "class-1" or "Class 10"
      let cleanClassNumber = cls.class_number;
      if (typeof cleanClassNumber === 'string') {
        // \D matches all non-digit characters and removes them
        cleanClassNumber = parseInt(cleanClassNumber.replace(/\D/g, ''), 10) || 0;
      }

      return {
        ...cls,
        batch: batchId,
        class_number: cleanClassNumber, // Inject the cleaned number
        content_details: typeof cls.content_details === 'string' 
          ? cls.content_details.split('\n').filter(item => item.trim() !== '') 
          : (cls.content_details || []),
        date_scheduled: null
      };
    });

    const newClasses = await ClassContent.insertMany(formattedClasses);

    const newIds = newClasses.map(c => c._id);
    await Batch.findByIdAndUpdate(batchId, { $push: { class_contents: { $each: newIds } } });

    res.status(201).json({ 
      success: true, 
      message: `${newClasses.length} items added to syllabus`, 
      data: newClasses 
    });
  } catch (error) {
    console.error("SYLLABUS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// 5. Assign a Date to an existing Class
export const scheduleClass = async (req, res) => {
  try {
    const { classContentId } = req.params;
    const { date_scheduled } = req.body;

    const updatedClass = await ClassContent.findByIdAndUpdate(
      classContentId, 
      { date_scheduled }, 
      { new: true }
    );

    res.status(200).json({ success: true, message: "Class scheduled", data: updatedClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const updateClassContent = async (req, res) => {
  try {
    const { classId } = req.params;
    const updateData = req.body;

    // If content_details is coming in as a string from a textarea, split it
    if (updateData.content_details && typeof updateData.content_details === 'string') {
      updateData.content_details = updateData.content_details.split('\n').filter(i => i.trim());
    }

    const updated = await ClassContent.findByIdAndUpdate(classId, updateData, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




// backend/controllers/batch.controller.js
// import { addDays, format } from "date-fns";
// import Batch from "../models/batch.js";
// import ClassContent from "../models/classContent.js";

// backend/controllers/batch.controller.js
// import { addDays, format, startOfDay } from "date-fns";
// import Batch from "../models/batch.js";
// import ClassContent from "../models/classContent.js";

const bdHolidays = [
  "02-21", "03-17", "03-26", "04-14", "05-01", "08-15", "12-16", "12-25",
  "2026-03-03", "2026-03-20", "2026-03-21", "2026-03-22", 
  "2026-05-27", "2026-05-28", "2026-05-29", "2026-06-26", "2026-10-21"
];

const isHoliday = (dateToCheck) => {
  const monthDay = format(dateToCheck, "MM-dd");
  const fullDate = format(dateToCheck, "yyyy-MM-dd");
  return bdHolidays.includes(monthDay) || bdHolidays.includes(fullDate);
};

export const autoScheduleSyllabus = async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await Batch.findById(batchId);

    if (!batch || !batch.start_date || !batch.schedule_days?.length) {
      return res.status(400).json({ success: false, message: "Batch missing Start Date or Schedule Days" });
    }

    const classes = await ClassContent.find({ batch: batchId }).sort({ class_number: 1 });

    if (classes.length === 0) {
      return res.status(400).json({ success: false, message: "Syllabus is empty." });
    }

    let currentCheckDate = startOfDay(new Date(batch.start_date));
    const updates = [];

    // প্রতিটি ক্লাসের জন্য লুপ
    for (const cls of classes) {
      let dateFound = false;
      
      while (!dateFound) {
        const dayName = format(currentCheckDate, "EEEE"); 
        
        // চেক: দিনটি কি শিডিউলে আছে এবং দিনটি কি ছুটির দিন নয়?
        if (batch.schedule_days.includes(dayName) && !isHoliday(currentCheckDate)) {
          updates.push(
            ClassContent.findByIdAndUpdate(cls._id, { 
              date_scheduled: new Date(currentCheckDate) 
            }).exec() // Mongoose Update-এর জন্য .exec() বাধ্যতামূলক
          );
          dateFound = true; // ডেট পাওয়া গেছে, লুপ ব্রেক করবে
        }
        
        // যদি ছুটির দিন হয় বা শিডিউলের দিন না হয়, তাহলে পরের দিন চেক করবে
        currentCheckDate = addDays(currentCheckDate, 1);
      }
    }

    await Promise.all(updates);

    res.status(200).json({ 
      success: true, 
      message: `Calendar generated successfully starting from ${format(new Date(batch.start_date), "PPP")}` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }

}




// Delete Batch and its Syllabus
export const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Delete all classes belonging to this batch
    await ClassContent.deleteMany({ batch: id });
    
    // 2. Delete the batch itself
    await Batch.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Batch and curriculum deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};





// backend/controllers/batch.controller.js এ যোগ করুন:

export const updateClassAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { attendanceRecords } = req.body; 
    // expected format: [{ student: "id1", status: "present" }, { student: "id2", status: "absent" }]

    const updatedClass = await ClassContent.findByIdAndUpdate(
      classId,
      { attendance: attendanceRecords },
      { new: true }
    ).populate('attendance.student', 'student_name student_id photo_url');

    res.status(200).json({ 
      success: true, 
      message: "Attendance updated successfully", 
      data: updatedClass 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};