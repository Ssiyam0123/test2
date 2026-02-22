import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Security: Don't return password by default in queries
    },
    role: {
      type: String,
      enum: ["admin", "instructor", "register", "staff"],
      default: "user",
    },

    employee_id: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    full_name: {
      type: String,
      default: "",
    },
    photo_url: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
    },
    designation: {
      type: String, // e.g., "Senior Culinary Instructor"
    },
    department: {
      type: String, // e.g., "Faculty", "Administration"
    },
    joining_date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Active", "On Leave", "Resigned"],
      default: "Active",
    },
    social_links: {
      facebook: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      custom: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
    // Add this to prevent empty objects if social_links isn't provided
    minimize: false,
  },
);

/**
 * Password Hashing Middleware
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Helper method for login validation
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
