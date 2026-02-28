import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.js";

dotenv.config();

const createAdmin = async () => {
  try {
    // 1. Connect to Database
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/cibdhk");
    console.log("🚀 MongoDB Connected...");

    const adminEmail = "admin@gmail.com";
    const adminUsername = "superadmin";

    // 2. Check for existing account
    const existingAdmin = await User.findOne({ 
      $or: [{ email: adminEmail }, { username: adminUsername }] 
    });

    if (existingAdmin) {
      console.log("⚠️  Admin already exists with this email or username.");
      process.exit();
    }

    // 3. Create the Admin Object with all required User fields
    const admin = new User({
      // Authentication Fields
      username: adminUsername,
      email: adminEmail,
      full_name : "siyam",
      password: "123456", 
      role: "admin",
      User_id: "ADM-001",
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

    // 4. Save to Database
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