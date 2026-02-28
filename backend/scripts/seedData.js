import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
import { addDays, subDays } from "date-fns";

// Models
import User from "../models/user.js";
import Course from "../models/course.js";
import Batch from "../models/batch.js";
import Student from "../models/student.js";
import ClassContent from "../models/classContent.js";
import Comment from "../models/comment.js";
import Branch from "../models/branch.js"; 
import Inventory from "../models/inventory.js";
import StockTransaction from "../models/stockTransaction.js";
import Expense from "../models/expense.js";

dotenv.config();

const CONFIG = {
  BRANCHES: [
    { name: "CIB Dhaka Main", code: "DHK" },
    { name: "CIB Chittagong", code: "CTG" },
    { name: "CIB Sylhet", code: "SYL" }
  ],
  NUM_INSTRUCTORS_PER_BRANCH: 2,
  NUM_COURSES: 6,
  BATCH_STUDENT_COUNTS: [15, 20, 10], 
  CLASSES_PER_BATCH: 8,
  INVENTORY_ITEMS: [
    { name: "Chicken", category: "Meat", unit: "kg" },
    { name: "Flour", category: "Dry Goods", unit: "kg" },
    { name: "Milk", category: "Dairy", unit: "L" },
    { name: "Olive Oil", category: "Dry Goods", unit: "L" },
    { name: "Truffles", category: "Produce", unit: "g" },
    { name: "Spatula", category: "Equipment", unit: "pcs" }
  ]
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
      Inventory.deleteMany({}),
      StockTransaction.deleteMany({}),
      Expense.deleteMany({})
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

    // 2. Create Global Courses
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
          username: faker.internet.username().toLowerCase(),
          email: faker.internet.email().toLowerCase(),
          password: "password123", // Will be hashed by pre-save hook
          role: "instructor",
          full_name: faker.person.fullName(),
          employee_id: `EMP-${branch.branch_code}-${faker.string.numeric(4)}`,
          designation: "Culinary Expert",
          branch: branch._id,
          status: "Active"
        }));
      }
    }

    // 4. Seed Initial Inventory & Financial Ledgers per Branch
    console.log("📦 Stocking Pantries & Financial Ledgers...");
    for (const branch of createdBranches) {
      for (const item of CONFIG.INVENTORY_ITEMS) {
        const qty = faker.number.int({ min: 10, max: 100 });
        const cost = qty * faker.number.int({ min: 50, max: 300 }); // e.g. 50-300 Taka per unit
        
        const invItem = await Inventory.create({
          branch: branch._id,
          item_name: item.name.toLowerCase(),
          category: item.category,
          unit: item.unit,
          quantity_in_stock: qty,
          reorder_threshold: 5
        });

        // Log the initial stock purchase transaction
        await StockTransaction.create({
          inventory_item: invItem._id,
          branch: branch._id,
          transaction_type: "PURCHASE",
          quantity: qty,
          total_cost: cost,
          supplier: "Initial Seed Supplier",
          performed_by: allInstructors.find(ins => ins.branch.equals(branch._id))._id
        });

        // Log the financial expense for the purchase
        await Expense.create({
          title: `Initial Restock: ${qty} ${item.unit} ${item.name}`,
          amount: cost,
          branch: branch._id,
          date_incurred: subDays(new Date(), faker.number.int({ min: 1, max: 30 })),
          recorded_by: allInstructors.find(ins => ins.branch.equals(branch._id))._id
        });
      }
    }

    // 5. Create Batches, Students, Classes, and Class Financials
    console.log("🎓 Creating Batches, Students, and Class Requisitions...");
    for (let i = 0; i < CONFIG.BATCH_STUDENT_COUNTS.length; i++) {
      const studentCount = CONFIG.BATCH_STUDENT_COUNTS[i];
      const currentBranch = createdBranches[i % createdBranches.length];
      const currentCourse = courses[i % courses.length];
      
      const branchInstructors = allInstructors.filter(ins => ins.branch.equals(currentBranch._id));
      const primaryInstructor = branchInstructors[0];

      // Create Batch (Notice instructors is an array now!)
// Create Batch (Notice instructors is an array now!)
      const batch = await Batch.create({
        batch_name: `Batch-${currentBranch.branch_code}-${i + 1}`,
        course: currentCourse._id,
        instructors: [primaryInstructor._id], 
        branch: currentBranch._id, 
        start_date: new Date(), // <--- FIXED: Starts today
        schedule_days: ["Saturday", "Monday", "Wednesday"],
        time_slot: { start_time: "10:00 AM", end_time: "01:00 PM" },
        status: "Active"
      });

      // Create Students
      const batchStudentIds = [];
      for (let s = 0; s < studentCount; s++) {
        const student = await Student.create({
          student_name: faker.person.fullName(),
          fathers_name: faker.person.fullName({ gender: "male" }),
          student_id: `STU-${currentBranch.branch_code}-${faker.string.numeric(5)}`,
          course: currentCourse._id,
          batch: batch._id,
          branch: currentBranch._id,
          gender: faker.helpers.arrayElement(["male", "female"]),
          issue_date: subDays(new Date(), faker.number.int({ min: 15, max: 30 })),
          email: faker.internet.email().toLowerCase(),
          contact_number: faker.phone.number(),
          address: faker.location.streetAddress(),
          status: "active"
        });
        batchStudentIds.push(student._id);

        // Add 1 random comment
        await Comment.create({
          student: student._id,
          instructor: primaryInstructor._id,
          text: faker.lorem.sentence()
        });
      }

      await Batch.findByIdAndUpdate(batch._id, { students: batchStudentIds });

      // Create Classes
      for (let c = 1; c <= CONFIG.CLASSES_PER_BATCH; c++) {
        // Let's make the first 3 classes "completed" with attendance and costs
        const isCompleted = c <= 3;
        const classDate = isCompleted ? subDays(new Date(), (4 - c) * 2) : addDays(new Date(), c * 2);

        // Generate Attendance Payload if completed
        const attendanceData = isCompleted ? batchStudentIds.map(id => ({
          student: id,
          status: faker.helpers.arrayElement(["present", "present", "present", "absent"]) // 75% present rate
        })) : [];

        // Generate Financials
        let financials = { budget: 0, actual_cost: 0, expense_notes: "" };
        if (isCompleted) {
          financials = {
            budget: faker.number.int({ min: 1000, max: 2000 }),
            actual_cost: faker.number.int({ min: 1200, max: 2500 }),
            expense_notes: "2 kg Chicken, 1 L Milk, 500 g Flour"
          };
        } else if (c === 4) {
          // A pending class with a requested budget but no actual cost yet
          financials = {
            budget: faker.number.int({ min: 1500, max: 3000 }),
            actual_cost: 0,
            expense_notes: "3 kg Beef, 2 L Olive Oil"
          };
        }

        const classRecord = await ClassContent.create({
          batch: batch._id,
          class_number: c,
          topic: `Module ${c}: ${faker.commerce.productAdjective()} Techniques`,
          date_scheduled: classDate,
          is_completed: isCompleted,
          instructor: isCompleted ? primaryInstructor._id : null,
          attendance: attendanceData,
          financials: financials
        });

        // Push class to batch
        await Batch.findByIdAndUpdate(batch._id, { $push: { class_contents: classRecord._id } });

        // If the class is completed, log its actual expense to the global ledger
        if (isCompleted) {
          await Expense.create({
            title: `Class ${c} Bazar: ${financials.expense_notes}`,
            amount: financials.actual_cost,
            class_content: classRecord._id,
            batch: batch._id,
            branch: currentBranch._id,
            recorded_by: primaryInstructor._id,
            date_incurred: classDate
          });
        }
      }
    }

    console.log("==========================================");
    console.log("✅ SEEDING SUCCESSFUL");
    console.log(`- Branches & Pantries Setup: ${createdBranches.length}`);
    console.log(`- Instructors Assigned: ${allInstructors.length}`);
    console.log(`- Global Financial Ledger Populated`);
    console.log("==========================================");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Failed:", error);
    process.exit(1);
  }
};

seedDatabase();