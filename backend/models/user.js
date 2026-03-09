import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    employee_id: { type: String, unique: true, sparse: true, trim: true },
    full_name: { type: String, required: true, trim: true },
    photo_url: { type: String, default: "" },
    phone: { type: String },
    designation: { type: String, trim: true },
    department: { type: String, trim: true },
    joining_date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Active", "On Leave", "Resigned"],
      default: "Active",
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    social_links: {
      facebook: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      custom: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

// Compound index for optimized filtering
userSchema.index({ branch: 1, role: 1, status: 1 });

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

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model("User", userSchema);
