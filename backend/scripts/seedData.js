import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const migrateDatabase = async () => {
  try {
    console.log("🚀 Starting Database Migration...");
    const mongoUri = process.env.MONGO_URI || '';
    
    // মঙ্গুজের মাধ্যমে কানেক্ট করা
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db; // 🚀 Native DB instance (Bypasses Schema Strictness)
    console.log("🔗 Connected to Native MongoDB.");

    // ==========================================
    // STEP 1: Default Branch Setup
    // ==========================================
    console.log("🏢 Checking Default Branch...");
    let defaultBranch = await db.collection("branches").findOne({ branch_code: "DHK" });
    
    if (!defaultBranch) {
      const branchRes = await db.collection("branches").insertOne({
        branch_name: "Dhaka HQ",
        branch_code: "DHK",
        address: "Dhanmondi, Dhaka",
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      defaultBranch = { _id: branchRes.insertedId };
      console.log("✅ Created Default Branch.");
    } else {
      console.log("✅ Default Branch exists.");
    }

    // ==========================================
    // STEP 2: Roles Setup
    // ==========================================
    console.log("🔐 Checking and Mapping Roles...");
    const rolesToMap = ["superadmin", "admin", "instructor", "registrar", "staff"];
    const roleCache = {};

    for (const roleName of rolesToMap) {
      let roleDoc = await db.collection("roles").findOne({ name: roleName });
      if (!roleDoc) {
        const roleRes = await db.collection("roles").insertOne({
          name: roleName,
          description: `Migrated ${roleName} role`,
          permissions: ["view_dashboard"], // বেসিক পারমিশন
          is_system_role: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        roleDoc = { _id: roleRes.insertedId };
      }
      roleCache[roleName] = roleDoc._id;
    }
    console.log("✅ Roles Ready.");

    // ==========================================
    // STEP 3: Migrate Users (String -> ObjectId)
    // ==========================================
    console.log("👤 Migrating Users...");
    const users = await db.collection("users").find().toArray();
    let userUpdateCount = 0;

    for (const user of users) {
      // যদি role আগে থেকেই ObjectId হয়, তাহলে স্কিপ করবে
      if (typeof user.role === "string") {
        let newRoleName = "staff"; // Default fallback
        if (user.role === "admin") newRoleName = "superadmin";
        if (user.role === "instructor") newRoleName = "instructor";
        if (user.role === "register") newRoleName = "registrar";

        await db.collection("users").updateOne(
          { _id: user._id },
          { 
            $set: { 
              role: roleCache[newRoleName], 
              branch: defaultBranch._id 
            } 
          }
        );
        userUpdateCount++;
      }
    }
    console.log(`✅ Migrated ${userUpdateCount} Users.`);

    // ==========================================
    // STEP 4: Migrate Students & Create Batches
    // ==========================================
    console.log("🎓 Migrating Students and Batches...");
    const students = await db.collection("students").find().toArray();
    let studentUpdateCount = 0;
    const batchCache = {}; // মেমোরিতে ব্যাচ আইডি সেভ রাখার জন্য

    for (const student of students) {
      // যদি batch স্ট্রিং হয় (যেমন: "Batch-01") তবেই আপডেট করবে
      if (typeof student.batch === "string") {
        const batchStringName = student.batch;

        // ১. চেক করবে এই নামের ব্যাচ কালেকশনে আছে কি না
        let batchDocId = batchCache[batchStringName];
        
        if (!batchDocId) {
          let existingBatch = await db.collection("batches").findOne({ batch_name: batchStringName });
          
          if (!existingBatch) {
            // নতুন ব্যাচ ক্রিয়েট করা (Dummy data দিয়ে)
            const newBatchRes = await db.collection("batches").insertOne({
              batch_name: batchStringName,
              course: student.course, // স্টুডেন্টের কোর্স রেফারেন্স ব্যবহার করা হলো
              branch: defaultBranch._id,
              start_date: new Date(), // ডিফল্ট ডেট
              schedule_days: ["Saturday", "Sunday"], // ডামি শিডিউল
              time_slot: { start_time: "10:00 AM", end_time: "02:00 PM" },
              status: "Active",
              createdAt: new Date(),
              updatedAt: new Date()
            });
            batchDocId = newBatchRes.insertedId;
          } else {
            batchDocId = existingBatch._id;
          }
          batchCache[batchStringName] = batchDocId; // ক্যাশে সেভ করে রাখলাম
        }

        // ২. স্টুডেন্টের স্ট্রিং ব্যাচকে নতুন ObjectId দিয়ে রিপ্লেস করা এবং Branch অ্যাড করা
        await db.collection("students").updateOne(
          { _id: student._id },
          { 
            $set: { 
              batch: batchDocId, 
              branch: defaultBranch._id 
            } 
          }
        );
        studentUpdateCount++;
      }
    }
    console.log(`✅ Migrated ${studentUpdateCount} Students and created Batches.`);

    console.log("\n🎉 DATABASE MIGRATION COMPLETED SUCCESSFULLY!");
    process.exit(0);

  } catch (error) {
    console.error("\n❌ Migration Failed:", error);
    process.exit(1);
  }
};

migrateDatabase();