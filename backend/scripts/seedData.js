import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
import { addDays, subMonths } from "date-fns";

// Models
import User from "../models/user.js";
import Course from "../models/course.js";
import Batch from "../models/batch.js";
import Student from "../models/student.js";
import ClassContent from "../models/classContent.js";
import Branch from "../models/branch.js"; 
import Inventory from "../models/inventory.js";
import Fee from "../models/fee.js";
import Payment from "../models/payment.js";
import Role from "../models/role.js"; 
import MasterSyllabus from "../models/masterSyllabus.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log("🚀 Syncing with MongoDB Compass Structure...");
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/cibdhk_test");

    console.log("🔐 Synchronizing Roles & Permissions Matrix...");
    
    const superadminPerms = [
      "view_dashboard", "manage_users", "view_roles", "manage_roles",
      "view_branches", "manage_branches", "view_courses", "manage_courses",
      "view_batches", "manage_batches", "view_students", "manage_students",
      "view_finance", "manage_finance", "view_inventory", "manage_inventory",
      "view_requisitions", "manage_requisitions", "view_attendance", "manage_attendance",
      "view_reports", "view_settings", "manage_settings"
    ];

    const rolesToEnsure = [
      { name: "superadmin", description: "Full System Access", permissions: superadminPerms, is_system_role: true },
      { name: "admin", description: "Branch Management Access", permissions: ["view_dashboard", "view_students", "manage_students"], is_system_role: true },
      { name: "registrar", description: "Handles student admissions and basic records.", permissions: ["view_students", "manage_students"], is_system_role: true },
      { name: "instructor", description: "Class & Student Management", permissions: ["view_dashboard", "view_courses", "manage_attendance"], is_system_role: true },
      { name: "staff", description: "General campus staff.", permissions: ["view_dashboard"], is_system_role: true }
    ];

    for (const r of rolesToEnsure) {
      await Role.findOneAndUpdate({ name: r.name }, r, { upsert: true, new: true });
    }

    const superRole = await Role.findOne({ name: "superadmin" });
    const instRole = await Role.findOne({ name: "instructor" });

    // 🧹 STEP 2: DEEP CLEAN (Except Roles)
    console.log("🧹 Clearing collections for fresh analytics...");
    await Promise.all([
      Branch.deleteMany({}), User.deleteMany({}), Course.deleteMany({}),
      Batch.deleteMany({}), Student.deleteMany({}), ClassContent.deleteMany({}),
      Inventory.deleteMany({}), Fee.deleteMany({}), Payment.deleteMany({}),
      MasterSyllabus.deleteMany({})
    ]);

    // 🏢 STEP 3: INFRASTRUCTURE
    console.log("🏢 Building Campuses...");
    const branches = await Branch.insertMany([
      { branch_name: "Dhaka HQ", branch_code: "DHK", address: "Dhanmondi", is_active: true },
      { branch_name: "Chittagong", branch_code: "CTG", address: "Agrabad", is_active: true }
    ]);

    // 👑 STEP 4: CREATE SIYAM ADMIN
    console.log("👑 Onboarding Master Superadmin...");
    await User.create({
      username: "suiii",
      email: "admin12@gmail.com",
      full_name: "Siyam Admin",
      password: "password123", 
      role: superRole._id,
      branch: branches[0]._id, 
      employee_id: "ADM-001",
      status: "Active"
    });

    // 📚 STEP 5: SYLLABUS & COURSES
    const courses = await Course.insertMany([
        { course_name: "Culinary Arts", course_code: "CAD", base_fee: 70000, duration: { value: 6, unit: "months" } }
    ]);

    const masterTopics = [];
    for(let i=1; i<=5; i++) {
        masterTopics.push({ topic: `Topic ${i}: Culinary Skills`, category: "General", order_index: i });
    }
    await MasterSyllabus.insertMany(masterTopics);

    // 📊 STEP 6: OPERATIONAL DATA (Analytics)
    console.log("📊 Injecting 6 months of financial history...");
    for (const branch of branches) {
      const chef = await User.create({
        username: `chef_${branch.branch_code.toLowerCase()}`,
        email: `chef.${branch.branch_code.toLowerCase()}@cib.com`,
        password: "password123",
        role: instRole._id,
        branch: branch._id,
        full_name: `Chef ${faker.person.firstName()}`,
        employee_id: `EMP-${branch.branch_code}`,
        status: "Active"
      });

      const batch = await Batch.create({
        batch_name: `${branch.branch_code}-B1`,
        course: courses[0]._id,
        instructors: [chef._id],
        branch: branch._id,
        start_date: subMonths(new Date(), 4),
        schedule_days: ["Monday", "Wednesday"],
        time_slot: { start_time: "10:00 AM", end_time: "01:00 PM" }, // ✅ REQUIRED
        status: "Active"
      });

      for (let s = 0; s < 5; s++) {
        const student = await Student.create({
          student_name: faker.person.fullName(),
          fathers_name: faker.person.fullName({ gender: 'male' }), // ✅ REQUIRED
          student_id: `STU-${branch.branch_code}-${faker.string.numeric(4)}`,
          course: courses[0]._id,
          batch: batch._id,
          branch: branch._id,
          gender: "male", // ✅ REQUIRED
          issue_date: subMonths(new Date(), 4), // ✅ REQUIRED
          status: "active"
        });

        const fee = await Fee.create({
          student: student._id, branch: branch._id, course: courses[0]._id,
          total_amount: 70000, net_payable: 65000, paid_amount: 0, status: "Partial"
        });

        // 📈 Fake Payments across 4 months for Revenue Chart
        for (let m = 0; m < 4; m++) {
          const amount = 5000 + (m * 2000);
          await Payment.create({
            fee_record: fee._id,
            student: student._id,
            branch: branch._id,
            amount: amount,
            payment_type: "Installment", // ✅ REQUIRED
            payment_method: "Cash", // ✅ REQUIRED
            collected_by: chef._id,
            receipt_number: `RCPT-${faker.string.alphanumeric(8).toUpperCase()}`, // ✅ UNIQUE
            createdAt: subMonths(new Date(), m)
          });
          fee.paid_amount += amount;
        }
        await fee.save();
      }
    }

    console.log("\n------------------------------------------");
    console.log("✅ COMPASS SYNCED & DATABASE SEEDED!");
    console.log("🚀 Admin: admin12@gmail.com / password123");
    console.log("------------------------------------------");
    process.exit(0);

  } catch (error) {
    console.error("❌ Seed Failed:", error);
    process.exit(1);
  }
};

seedDatabase();