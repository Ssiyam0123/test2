import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { connectDb } from "./lib/db.js";

// ==========================================
// ROUTE IMPORTS
// ==========================================
import authRoute from "./routes/authRoutes.js";
import userRoute from "./routes/userRoutes.js";
import studentRoute from "./routes/studentRoutes.js";
import courseRoutes from "./routes/courseRoute.js";
import dashbordRoutes from "./routes/dashboard.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";
import branchRoutes from "./routes/branchRoutes.js";
import expenseRoutes from "./routes/expenseRoute.js";
import inventoryRoutes from "./routes/inventory.route.js";

// The new separated academic/operational routes
import batchRoutes from "./routes/batchRoutes.js"; 
import financeRoutes from "./routes/finance.routes.js"; 
import classRoutes from "./routes/class.route.js"; 
import requisitionRoutes from "./routes/requisition.route.js"; 
import roleRoutes from "./routes/role.routes.js";
const app = express();
const __dirname = path.resolve();

// ==========================================
// MIDDLEWARE & CONFIG
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

app.options("/:path*", cors()); // Preflight handler

// Static files (Images, etc.)
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ==========================================
// API ROUTES
// ==========================================
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/admin", userRoute); // Note: You have userRoute mounted twice, ensure this is intentional
app.use("/api/students", studentRoute);
app.use("/api/courses", courseRoutes);
app.use("/api/branches", branchRoutes);

// Core Modules
app.use("/api/batches", batchRoutes);
app.use("/api/classes", classRoutes);           // NEW: Academic Syllabus & Attendance
app.use("/api/requisitions", requisitionRoutes); // NEW: Financials & Bazar Lists

// Analytics & Operations
app.use("/api/inventory", inventoryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashbordRoutes);
app.use("/api/generate-certificate", certificateRoutes);
app.use("/api/finance", financeRoutes);

app.use("/api/roles", roleRoutes);
// ==========================================
// SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 3030;

app.listen(PORT, async () => {
  await connectDb(); // Connect to DB right before listening
  console.log(`Server is running on port ${PORT}`);
});

export default app;