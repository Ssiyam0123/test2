import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
import { addDays } from "date-fns";

// Models
import User from "../models/user.js";
import Course from "../models/course.js";
import Batch from "../models/batch.js";
import Student from "../models/student.js";
import ClassContent from "../models/classContent.js";
import Comment from "../models/comment.js";

dotenv.config();

// ==========================================
// SEED CONFIGURATION (DYNAMIC PER-BATCH LIMITS)
// ==========================================
const CONFIG = {
  NUM_INSTRUCTORS: 3,
  NUM_COURSES: 7,
  // Define exactly how many students per batch here.
  // Length of this array determines NUM_BATCHES.
  BATCH_STUDENT_COUNTS: [25, 12, 43, 8, 26, 86, 72],
  CLASSES_PER_BATCH: 36,
  COMMENTS_PER_STUDENT: 5,
  CLASS_DAYS_INTERVAL: 4,
};

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/cibdhk";

const seedDatabase = async () => {
  try {
    console.log("Connecting to:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    console.log("Cleaning database...");
    await Promise.all([
      User.deleteMany({ role: { $ne: "admin" } }),
      Course.deleteMany({}),
      Batch.deleteMany({}),
      Student.deleteMany({}),
      ClassContent.deleteMany({}),
      Comment.deleteMany({}),
    ]);

    // 1. Create Instructors
    const instructors = [];
    for (let i = 0; i < CONFIG.NUM_INSTRUCTORS; i++) {
      instructors.push(
        await User.create({
          username: faker.internet.username(),
          email: faker.internet.email(),
          password: "password123",
          role: "instructor",
          employee_id: `EMP-${faker.string.numeric(5)}`,
          full_name: faker.person.fullName(),
          designation: "Senior Instructor",
          department: "Culinary Arts",
          status: "Active",
        }),
      );
    }

    // 2. Create Courses
    const courses = [];
    for (let i = 0; i < CONFIG.NUM_COURSES; i++) {
      const name = faker.commerce.productName() + " Professional";
      courses.push(
        await Course.create({
          course_name: name,
          course_code:
            name.substring(0, 3).toUpperCase() + faker.string.numeric(3),
          duration: { value: 3, unit: "months" },
          description: faker.lorem.sentence(),
          additional_info: ["Uniform Included"],
        }),
      );
    }

    // 3. Create Batches & Students (Variable Counts)
    const allStudents = [];
    const numBatches = CONFIG.BATCH_STUDENT_COUNTS.length;

    for (let bIndex = 0; bIndex < numBatches; bIndex++) {
      const studentCount = CONFIG.BATCH_STUDENT_COUNTS[bIndex];

      // Create the Batch first
      const batch = await Batch.create({
        batch_name: `Batch ${bIndex + 1} (${faker.string.alphanumeric(3).toUpperCase()})`,
        course: courses[bIndex % courses.length]._id,
        instructor: instructors[bIndex % instructors.length]._id,
        start_date: faker.date.past(),
        schedule_days: ["Sunday", "Tuesday"],
        time_slot: { start_time: "09:00 AM", end_time: "12:00 PM" },
        status: "Active",
      });

      console.log(
        `Generating ${studentCount} students for ${batch.batch_name}...`,
      );

      const batchStudentIds = [];
      for (let sIndex = 0; sIndex < studentCount; sIndex++) {
        const student = await Student.create({
          student_name: faker.person.fullName(),
          fathers_name: faker.person.fullName({ gender: "male" }),
          student_id: `STU-${bIndex}${faker.string.numeric(5)}`,
          registration_number: `REG-${bIndex}${faker.string.numeric(7)}`,
          course: batch.course,
          batch: batch._id,
          gender: faker.helpers.arrayElement(["male", "female"]),
          issue_date: new Date(),
          status: "active",
          email: faker.internet.email(),
          contact_number: faker.phone.number(),
          address: faker.location.streetAddress(),
        });

        batchStudentIds.push(student._id);
        allStudents.push(student);
      }

      // Update Batch with student list
      await Batch.findByIdAndUpdate(batch._id, { students: batchStudentIds });

      // 4. Create Class Content for THIS specific batch
      const classContentIds = [];
      const baseDate = new Date();

      for (let j = 1; j <= CONFIG.CLASSES_PER_BATCH; j++) {
        const classDate = addDays(
          baseDate,
          (j - 1) * CONFIG.CLASS_DAYS_INTERVAL,
        );

        const cls = await ClassContent.create({
          batch: batch._id,
          class_number: j,
          topic: faker.company.catchPhrase(),
          content_details: [faker.lorem.sentence()],
          date_scheduled: classDate,
          is_completed: classDate < new Date(),
          attendance: batchStudentIds.map((sId) => ({
            student: sId,
            student_name: faker.person.fullName(), // Simplified for seeding speed
            status: faker.helpers.arrayElement(["present", "absent"]),
          })),
        });
        classContentIds.push(cls._id);
      }
      await Batch.findByIdAndUpdate(batch._id, {
        class_contents: classContentIds,
      });
    }

    // 5. Create Comments
    console.log("Adding instructor feedback...");
    for (const student of allStudents) {
      await Comment.create({
        student: student._id,
        instructor:
          instructors[Math.floor(Math.random() * instructors.length)]._id,
        text: faker.lorem.sentence(),
      });
    }

    console.log("==========================================");
    console.log("✅ SEEDING COMPLETE");
    console.log(`- Total Batches: ${numBatches}`);
    console.log(`- Total Students: ${allStudents.length}`);
    console.log(`- Distribution: ${CONFIG.BATCH_STUDENT_COUNTS.join(", ")}`);
    console.log("==========================================");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
};

seedDatabase();
