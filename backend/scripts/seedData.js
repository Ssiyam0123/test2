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
import Branch from "../models/branch.js"; // Added Branch Model

dotenv.config();

const CONFIG = {
  // We'll create 3 branches: Dhaka, Chittagong, Sylhet
  BRANCHES: [
    { name: "CIB Dhaka Main", code: "DHK" },
    { name: "CIB Chittagong", code: "CTG" },
    { name: "CIB Sylhet", code: "SYL" }
  ],
  NUM_INSTRUCTORS_PER_BRANCH: 2,
  NUM_COURSES: 6,
  // Distribution of students across batches
  BATCH_STUDENT_COUNTS: [25, 43, 12, 30, 18, 55], 
  CLASSES_PER_BATCH: 12,
};

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/cibdhk";

const seedDatabase = async () => {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);

    console.log("🧹 Cleaning database...");
    await Promise.all([
      Branch.deleteMany({}),
      User.deleteMany({ role: { $ne: "admin" } }),
      Course.deleteMany({}),
      Batch.deleteMany({}),
      Student.deleteMany({}),
      ClassContent.deleteMany({}),
      Comment.deleteMany({}),
    ]);

    // 1. Create Branches
    console.log("🏢 Creating Branches...");
    const createdBranches = await Promise.all(
      CONFIG.BRANCHES.map(b => Branch.create({
        branch_name: b.name,
        branch_code: b.code,
        address: faker.location.streetAddress(),
        contact_email: `contact@${b.code.toLowerCase()}.cib.com`,
        contact_phone: faker.phone.number(),
        is_active: true
      }))
    );

    // 2. Create Global Courses (Shared across branches)
    console.log("📚 Creating Global Courses...");
    const courses = [];
    for (let i = 0; i < CONFIG.NUM_COURSES; i++) {
      courses.push(await Course.create({
        course_name: `${faker.commerce.productName()} Professional`,
        course_code: `CRS-${faker.string.alphanumeric(3).toUpperCase()}`,
        duration: { value: 3, unit: "months" },
        description: faker.lorem.paragraph(),
        is_active: true
      }));
    }

    // 3. Create Instructors assigned to specific branches
    console.log("👨‍🍳 Creating Branch-specific Instructors...");
    const allInstructors = [];
    for (const branch of createdBranches) {
      for (let i = 0; i < CONFIG.NUM_INSTRUCTORS_PER_BRANCH; i++) {
        allInstructors.push(await User.create({
          username: faker.internet.username(),
          email: faker.internet.email(),
          password: "password123",
          role: "instructor",
          full_name: faker.person.fullName(),
          employee_id: `EMP-${branch.branch_code}-${faker.string.numeric(4)}`,
          designation: "Culinary Expert",
          branch: branch._id, // Assigned to branch
          status: "Active"
        }));
      }
    }

    // 4. Create Batches & Students
    console.log("🎓 Creating Batches and Students...");
    for (let i = 0; i < CONFIG.BATCH_STUDENT_COUNTS.length; i++) {
      const studentCount = CONFIG.BATCH_STUDENT_COUNTS[i];
      // Distribute batches across branches cycle
      const currentBranch = createdBranches[i % createdBranches.length];
      const currentCourse = courses[i % courses.length];
      // Filter instructors for THIS branch only
      const branchInstructors = allInstructors.filter(ins => ins.branch.equals(currentBranch._id));
      const instructor = branchInstructors[0];

      const batch = await Batch.create({
        batch_name: `Batch-${currentBranch.branch_code}-${i + 1}`,
        course: currentCourse._id,
        instructor: instructor._id,
        branch: currentBranch._id, // Batch tied to Branch
        start_date: new Date(),
        schedule_days: ["Saturday", "Monday", "Wednesday"],
        time_slot: { start_time: "10:00 AM", end_time: "01:00 PM" },
        status: "Active"
      });

      const batchStudentIds = [];
      for (let s = 0; s < studentCount; s++) {
        const student = await Student.create({
          student_name: faker.person.fullName(),
          fathers_name: faker.person.fullName({ gender: "male" }),
          student_id: `STU-${currentBranch.branch_code}-${faker.string.numeric(5)}`,
          course: currentCourse._id,
          batch: batch._id,
          branch: currentBranch._id, // Student tied to Branch
          gender: faker.helpers.arrayElement(["male", "female"]),
          issue_date: new Date(),
          email: faker.internet.email(),
          contact_number: faker.phone.number(),
          address: faker.location.streetAddress(),
          status: "active"
        });
        batchStudentIds.push(student._id);

        // Add 2-3 random comments for each student
        await Comment.create({
          student: student._id,
          instructor: instructor._id,
          text: faker.lorem.sentence()
        });
      }

      // Link students to batch
      await Batch.findByIdAndUpdate(batch._id, { students: batchStudentIds });

      // Create Class Content
      for (let c = 1; c <= CONFIG.CLASSES_PER_BATCH; c++) {
        await ClassContent.create({
          batch: batch._id,
          class_number: c,
          topic: `Module ${c}: ${faker.commerce.productAdjective()} Techniques`,
          date_scheduled: addDays(new Date(), c * 2),
          is_completed: false
        });
      }
    }

    console.log("==========================================");
    console.log("✅ SEEDING SUCCESSFUL");
    console.log(`- Branches Created: ${createdBranches.length}`);
    console.log(`- Total Students: ${CONFIG.BATCH_STUDENT_COUNTS.reduce((a, b) => a + b, 0)}`);
    console.log("==========================================");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Failed:", error);
    process.exit(1);
  }
};

seedDatabase();