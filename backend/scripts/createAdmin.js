import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.js";
import Role from "../models/role.js"; // 🚀 1. IMPORT ROLE MODEL

dotenv.config();

const createAdmin = async () => {
  try {
    // 1. Connect to Database
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/cibdhk");
    console.log("🚀 MongoDB Connected...");

    const adminEmail = "admin122@gmail.com";
    const adminUsername = "hiiii";

    // 🚀 2. FETCH THE SUPERADMIN ROLE FROM THE DATABASE
    const superAdminRole = await Role.findOne({ name: "superadmin" });
    if (!superAdminRole) {
      console.error("❌ Superadmin role not found! Please run 'node scripts/migrateRoles.js' first.");
      process.exit(1);
    }

    // 3. Check for existing account
    const existingAdmin = await User.findOne({ 
      $or: [{ email: adminEmail }, { username: adminUsername }] 
    });

    if (existingAdmin) {
      console.log("⚠️  Admin already exists with this email or username.");
      process.exit();
    }

    // 4. Create the Admin Object
    const admin = new User({
      // Authentication Fields
      username: adminUsername,
      email: adminEmail,
      full_name : "siyam",
      password: "123456", 
      role: superAdminRole._id, 
      employee_id: "ADM-001",   
      phone: "01700000000",
      designation: "Super Admin",
      department: "Management",
      status: "Active",
      joining_date: new Date(),
      social_links: {
        facebook: "",
        linkedin: "",
        twitter: "",
        instagram: ""
      }
    });

    // 5. Save to Database
    await admin.save();

    console.log("✅ Admin created successfully!");
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: 123456`);
    
    process.exit();
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();