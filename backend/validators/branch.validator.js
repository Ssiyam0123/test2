import Branch from "../models/branch.js";

// 1. Check Required Fields & Formats
export const validateBranchFields = (req, res, next) => {
  const { branch_name, branch_code, address, contact_email, contact_phone } = req.body;

  // Check required fields
  const requiredFields = { branch_name, branch_code, address };
  const missingFields = Object.keys(requiredFields).filter(
    (key) => !requiredFields[key] || String(requiredFields[key]).trim() === ""
  );

  if (missingFields.length > 0) {
    return res.status(400).json({ 
      success: false, 
      message: `Missing required fields: ${missingFields.join(", ")}` 
    });
  }

  // Validate Branch Code Format (e.g., 2-5 alphanumeric characters, like DHK or CTG-01)
  const codeRegex = /^[A-Za-z0-9\-]{2,10}$/;
  if (!codeRegex.test(branch_code)) {
    return res.status(400).json({ 
      success: false, 
      message: "Branch code must be 2-10 alphanumeric characters (hyphens allowed)." 
    });
  }

  // Validate Email if provided
  if (contact_email && contact_email.trim() !== "") {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(contact_email)) {
      return res.status(400).json({ success: false, message: "Invalid contact email format." });
    }
  }

  // Validate Phone if provided
  if (contact_phone && contact_phone.trim() !== "") {
    const phoneRegex = /^[0-9+\-\s()]*$/;
    if (!phoneRegex.test(contact_phone)) {
      return res.status(400).json({ success: false, message: "Invalid contact phone format." });
    }
  }

  next();
};

// 2. Check for Duplicates (Name & Code must be universally unique)
export const checkBranchDuplicates = async (req, res, next) => {
  try {
    const branchName = req.body.branch_name?.trim();
    const branchCode = req.body.branch_code?.trim();
    const excludeDbId = req.params.id || null; // For updates, ignore the current branch

    if (!branchName && !branchCode) return next();

    const query = { $or: [] };
    
    // Use regex for case-insensitive exact matching
    if (branchName) query.$or.push({ branch_name: new RegExp(`^${branchName}$`, "i") });
    if (branchCode) query.$or.push({ branch_code: new RegExp(`^${branchCode}$`, "i") });

    if (excludeDbId) {
      query._id = { $ne: excludeDbId };
    }

    if (query.$or.length > 0) {
      const existing = await Branch.findOne(query).select("branch_name branch_code");

      if (existing) {
        if (branchCode && existing.branch_code.toUpperCase() === branchCode.toUpperCase()) {
          return res.status(400).json({ 
            success: false, 
            message: `Branch Code "${branchCode.toUpperCase()}" is already assigned to another branch.` 
          });
        }
        return res.status(400).json({ 
          success: false, 
          message: `Branch Name "${branchName}" already exists in the system.` 
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Error validating branch duplicates." });
  }
};

// 3. Sanitize and Format Payload
export const processBranchPayload = (req, res, next) => {
  try {
    const payload = { ...req.body };

    // Standardize Strings
    if (payload.branch_name) payload.branch_name = payload.branch_name.trim();
    
    // CRITICAL: Branch code must ALWAYS be uppercase to ensure consistent ID generation later
    if (payload.branch_code) payload.branch_code = payload.branch_code.trim().toUpperCase();
    
    if (payload.address) payload.address = payload.address.trim();
    if (payload.contact_phone) payload.contact_phone = payload.contact_phone.trim();
    if (payload.contact_email) payload.contact_email = payload.contact_email.trim().toLowerCase();

    // Parse Boolean safely
    if (payload.is_active !== undefined) {
      payload.is_active = payload.is_active === "true" || payload.is_active === true;
    }

    // Clean up empty strings or undefined values to avoid overwriting existing data with blanks
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) delete payload[key];
    });

    // Replace the request body with the perfectly clean payload
    req.body = payload;
    next();
  } catch (error) {
    res.status(400).json({ success: false, message: "Error processing branch payload." });
  }
};