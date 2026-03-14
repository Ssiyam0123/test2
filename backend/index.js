import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { connectDb } from "./lib/db.js";

// 🚀 Error Handling Imports
import { globalErrorHandler } from "./middlewares/errorHandler.js";
import AppError from "./utils/AppError.js";

// ==========================================
// 🚀 ROUTE IMPORTS
// ==========================================
import authRoute from "./routes/authRoutes.js";
import userRoute from "./routes/userRoutes.js";
import roleRoutes from "./routes/role.routes.js";
import studentRoute from "./routes/studentRoutes.js";
import courseRoutes from "./routes/courseRoute.js";
import masterSyllabus from "./routes/masterSyllabus.routes.js";
import branchRoutes from "./routes/branchRoutes.js";
import batchRoutes from "./routes/batchRoutes.js"; 
import classRoutes from "./routes/class.route.js"; 
import dashbordRoutes from "./routes/dashboard.routes.js";
import financeRoutes from "./routes/finance.routes.js"; 
import expenseRoutes from "./routes/expenseRoute.js";
import inventoryRoutes from "./routes/inventory.route.js";
import requisitionRoutes from "./routes/requisition.route.js"; 
import certificateRoutes from "./routes/certificate.routes.js";
import holidayRoutes from "./routes/holiday.routes.js";

const app = express();
const __dirname = path.resolve();

// ==========================================
// 🛠️ MIDDLEWARE & CONFIG
// ==========================================
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "https://verification.cibdhk.com",
      // "https://cibdhk.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors()); // Preflight handler for all routes

// Static files (Images, etc.)
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ==========================================
// 🔗 API ROUTES
// ==========================================
// Auth & Access Control
app.use("/api/auth", authRoute);
app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoute); 
// app.use("/api/admin", userRoute); // ⚠️ Note: Duplicate of users, remove if not needed

// Setup & Configuration
app.use("/api/branches", branchRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/syllabus", masterSyllabus);

// Operations & Academics
app.use("/api/students", studentRoute);
app.use("/api/batches", batchRoutes);
app.use("/api/classes", classRoutes);          
app.use("/api/dashboard", dashbordRoutes);

// Finance & Inventory
app.use("/api/finance", financeRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/requisitions", requisitionRoutes); 

// Utilities
app.use("/api/generate-certificate", certificateRoutes);
app.use("/api/holidays", holidayRoutes);

app.get("/",(req,res)=>{
  res.send("hello world");
})
// ==========================================
// 🛑 GLOBAL ERROR HANDLING ARCHITECTURE
// ==========================================
// 1. Handle Unmatched Routes (404)
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 2. The Global Error Handler (Catches all next(error))
app.use(globalErrorHandler);

// ==========================================
// 🚀 SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 3030;

app.listen(PORT, async () => {
  await connectDb(); // Connect to DB right before listening
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🛡️ Global Error Handler & PBAC Active!`);
});

export default app;