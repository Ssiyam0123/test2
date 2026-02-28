// backend/lib/utils.js
import User from "../models/user.js";

export const generateEmployeeId = async (role) => {
  // 1. Determine the prefix based on the role
  let prefix = "EMP";
  if (role === "instructor") prefix = "INS";
  if (role === "admin" || role === "superadmin") prefix = "ADM";
  if (role === "registrar") prefix = "REG";
  if (role === "staff") prefix = "STF";

  const currentYear = new Date().getFullYear();
  const fullPrefix = `${prefix}-${currentYear}-`;

  // 2. Find the last user created with this specific prefix
  const lastUser = await User.findOne({ employee_id: new RegExp(`^${fullPrefix}`) })
    .sort({ employee_id: -1 }) // Sort descending to get the highest number
    .select("employee_id")
    .lean();

  // 3. Increment the number or start at 001
  let nextNumber = 1;
  if (lastUser && lastUser.employee_id) {
    const lastNumberStr = lastUser.employee_id.replace(fullPrefix, "");
    const lastNumber = parseInt(lastNumberStr, 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  // 4. Pad with zeros (e.g., 1 becomes "001")
  const paddedNumber = nextNumber.toString().padStart(3, "0");

  return `${fullPrefix}${paddedNumber}`;
};