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
import Expense from "../models/expense.js";
import Fee from "../models/fee.js";
import Payment from "../models/payment.js";
import StockTransaction from "../models/stockTransaction.js";

dotenv.config();

const CONFIG = {
  BRANCHES: [
    { name: "CIB Dhaka Main", code: "DHK" },
    { name: "CIB Chittagong", code: "CTG" },
    { name: "CIB Sylhet", code: "SYL" }
  ],
  NUM_INSTRUCTORS_PER_BRANCH: 2,
  NUM_COURSES: 5,
  BATCH_STUDENT_COUNTS: [12, 15, 10], 
  CLASSES_PER_BATCH: 6,
  INVENTORY_ITEMS: [
    { name: "Chicken", category: "Meat", unit: "kg" },
    { name: "Flour", category: "Dry Goods", unit: "kg" },
    { name: "Milk", category: "Dairy", unit: "L" },
    { name: "Butter", category: "Dairy", unit: "g" },
    { name: "Chef Knife", category: "Equipment", unit: "pcs" }
  ]
};

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/cibdhk";

const seedDatabase = async () => {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);

    console.log("🧹 Cleaning existing data (Keeping Superadmins)...");
    await Promise.all([
      Branch.deleteMany({}),
      User.deleteMany({ role: { $ne: "superadmin" } }), 
      Course.deleteMany({}),
      Batch.deleteMany({}),
      Student.deleteMany({}),
      ClassContent.deleteMany({}),
      Comment.deleteMany({}),
      Inventory.deleteMany({}),
      StockTransaction.deleteMany({}),
      Expense.deleteMany({}),
      Fee.deleteMany({}),
      Payment.deleteMany({})
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

    // 2. Create Global Courses with Base Fees
    console.log("📚 Creating Courses with Fee Structures...");
    const courses = [];
    const baseFees = [25000, 35000, 45000, 50000, 60000];
    for (let i = 0; i < CONFIG.NUM_COURSES; i++) {
      courses.push(await Course.create({
        course_name: `${faker.commerce.productName()} Culinary Arts`,
        course_code: `CRS-${faker.string.alphanumeric(3).toUpperCase()}`,
        duration: { value: 3, unit: "months" },
        base_fee: baseFees[i] || 30000,
        description: faker.lorem.sentence(),
        is_active: true
      }));
    }

    // 3. Create Instructors
    console.log("👨‍🍳 Creating Branch-specific Instructors...");
    const allInstructors = [];
    for (const branch of createdBranches) {
      for (let i = 0; i < CONFIG.NUM_INSTRUCTORS_PER_BRANCH; i++) {
        allInstructors.push(await User.create({
          username: faker.internet.username().toLowerCase(), 
          email: faker.internet.email().toLowerCase(),
          password: "password123", 
          role: "instructor",
          full_name: faker.person.fullName(),
          employee_id: `EMP-${branch.branch_code}-${faker.string.numeric(4)}`,
          designation: "Chef Instructor",
          branch: branch._id,
          status: "Active"
        }));
      }
    }

    // 4. Seed Inventory & Log Purchase Expenses
    console.log("📦 Stocking Kitchens & Logging Expenses...");
    for (const branch of createdBranches) {
      const branchInstructor = allInstructors.find(ins => ins.branch.equals(branch._id));
      
      for (const item of CONFIG.INVENTORY_ITEMS) {
        const qty = faker.number.int({ min: 20, max: 100 });
        const cost = qty * faker.number.int({ min: 100, max: 400 });
        
        const invItem = await Inventory.create({
          branch: branch._id,
          item_name: item.name.toLowerCase(),
          category: item.category,
          unit: item.unit,
          quantity_in_stock: qty,
          reorder_threshold: 5
        });

        await StockTransaction.create({
          inventory_item: invItem._id,
          branch: branch._id,
          transaction_type: "PURCHASE",
          quantity: qty,
          total_cost: cost,
          performed_by: branchInstructor._id
        });

        await Expense.create({
          title: `Initial Pantry Stock: ${item.name}`,
          amount: cost,
          branch: branch._id,
          recorded_by: branchInstructor._id,
          date_incurred: subDays(new Date(), 5)
        });
      }
    }

    // 5. Create Batches, Students & Financial Ledgers
    console.log("🎓 Processing Admissions & Installments...");
    for (let i = 0; i < createdBranches.length; i++) {
      const branch = createdBranches[i];
      const course = courses[i % courses.length];
      const instructor = allInstructors.find(ins => ins.branch.equals(branch._id));

      const batch = await Batch.create({
        batch_name: `B-${branch.branch_code}-${faker.string.numeric(3)}`,
        course: course._id,
        instructors: [instructor._id],
        branch: branch._id,
        start_date: new Date(),
        schedule_days: ["Saturday", "Monday", "Wednesday"],
        time_slot: { start_time: "10:00 AM", end_time: "01:00 PM" },
        status: "Active"
      });

      const studentIds = [];
      const count = CONFIG.BATCH_STUDENT_COUNTS[i] || 10;

      for (let s = 0; s < count; s++) {
        const student = await Student.create({
          student_name: faker.person.fullName(),
          fathers_name: faker.person.fullName({ gender: "male" }),
          student_id: `STU-${branch.branch_code}-${faker.string.numeric(5)}`,
          course: course._id,
          batch: batch._id,
          branch: branch._id,
          gender: faker.helpers.arrayElement(["male", "female"]),
          issue_date: subDays(new Date(), 2),
          status: "active"
        });
        studentIds.push(student._id);

        // CREATE FEE LEDGER
        const discount = faker.helpers.arrayElement([0, 0, 5000, 10000]);
        const netPayable = course.base_fee - discount;
        const scenario = faker.helpers.arrayElement(["paid", "partial", "unpaid"]);
        let paidAmount = 0;

        const fee = await Fee.create({
          student: student._id,
          branch: branch._id,
          course: course._id,
          total_amount: course.base_fee,
          discount: discount,
          net_payable: netPayable,
          paid_amount: 0,
          status: "Unpaid"
        });

        // SIMULATE PAYMENTS
        if (scenario === "paid") {
          await Payment.create({
            fee_record: fee._id,
            student: student._id,
            branch: branch._id,
            amount: netPayable,
            payment_type: "Admission Fee",
            payment_method: "Bank Transfer",
            collected_by: instructor._id
          });
          paidAmount = netPayable;
        } else if (scenario === "partial") {
          await Payment.create({
            fee_record: fee._id,
            student: student._id,
            branch: branch._id,
            amount: 15000,
            payment_type: "Admission Fee",
            payment_method: "Cash",
            collected_by: instructor._id
          });
          paidAmount = 15000;
        }

        // Update fee record with paid totals
        fee.paid_amount = paidAmount;
        fee.status = paidAmount >= netPayable ? "Paid" : paidAmount > 0 ? "Partial" : "Unpaid";
        await fee.save();
      }

      await Batch.findByIdAndUpdate(batch._id, { students: studentIds });
    }

    console.log("==========================================");
    console.log("✅ SYSTEM SEEDED SUCCESSFULLY");
    console.log("==========================================");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Failed:", error);
    process.exit(1);
  }
};

seedDatabase();