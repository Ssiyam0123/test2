import fs from "fs";
import path from "path";
import multer from "multer";

// Safe Path Resolution for ES Modules
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const STUDENT_DIR = path.join(UPLOADS_DIR, "students");
const EMPLOYEE_DIR = path.join(UPLOADS_DIR, "employees");

// Ensure directories exist
[STUDENT_DIR, EMPLOYEE_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.originalUrl.includes("/employees/") || req.originalUrl.includes("/user")) {
      cb(null, EMPLOYEE_DIR);
    } else {
      cb(null, STUDENT_DIR); 
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 }, // 1MB limit for profile photos
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);

    if (ext && mime) {
      return cb(null, true);
    }
    cb(new Error("Invalid file type. Only JPG, PNG, and WEBP are allowed."), false);
  },
});

// Helper to securely delete files from disk (Rollback / Deletion)
export const deleteLocalFile = (relativePath) => {
  if (!relativePath) return;

  try {
    // Prevent directory traversal attacks
    if (!relativePath.startsWith("/uploads/")) return;
    
    const absolutePath = path.join(process.cwd(), "public", relativePath);
    
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch (err) {
    console.error("❌ Failed to delete local file:", err.message);
  }
};