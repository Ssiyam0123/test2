import express from "express";
import "dotenv/config";
import authRoute from "./routes/authRoutes.js";
import studentRoute from "./routes/studentRoutes.js";
import { connectDb } from "./lib/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import courseRoutes from "./routes/courseRoute.js";
import dashbordRoutes from "./routes/dashboard.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import userRoute from "./routes/userRoutes.js";
const app = express();

// Connect to Database
connectDb();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS Configuration
app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "https://verification.cibdhk.com",
      //   "https://cibdhk.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.options("/:path*", cors());

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
// In your index.js

// Mount it here
app.use("/api/users", userRoute);

app.use("/api/auth", authRoute);
app.use("/api/students", studentRoute);
app.use("/api/admin", userRoute);
app.use("/api/courses", courseRoutes);
app.use("/api/dashboard", dashbordRoutes);
app.use("/api/generate-certificate", certificateRoutes);

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
