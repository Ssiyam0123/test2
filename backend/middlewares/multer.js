import fs from "fs";
import path from "path";
import multer from "multer";

// 1. Ensure BOTH upload directories exist dynamically
const studentUploadDir = path.join(process.cwd(), "public", "uploads", "students");
const employeeUploadDir = path.join(process.cwd(), "public", "uploads", "employees");

if (!fs.existsSync(studentUploadDir)) {
  fs.mkdirSync(studentUploadDir, { recursive: true });
}
if (!fs.existsSync(employeeUploadDir)) {
  fs.mkdirSync(employeeUploadDir, { recursive: true });
}

// 2. Local Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // FIX: Check for "/users/" since the route was updated for the unified User model
    // (Kept "/employees/" just in case you have legacy routes)
    if (req.originalUrl.includes("/employees/") || req.originalUrl.includes("/users/")) {
      cb(null, employeeUploadDir);
    } else {
      cb(null, studentUploadDir); // Default fallback for students
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 0.5 * 1024 * 1024 }, // 500kb limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);

    if (ext && mime) {
      return cb(null, true);
    }
    cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"), false);
  },
});

// 3. Helper to securely delete files from disk
export const deleteLocalFile = (relativePath) => {
  if (!relativePath) return;
  try {
    // Strict check to prevent directory traversal attacks
    if (!relativePath.startsWith("/uploads/")) return;
    
    const absolutePath = path.join(process.cwd(), "public", relativePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch (err) {
    console.error("Failed to delete local file:", err);
  }
};