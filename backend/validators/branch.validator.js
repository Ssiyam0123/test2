import Branch from "../models/branch.js";

export const validateBranchFields = (req, res, next) => {
  const { branch_name, branch_code, address, contact_email, contact_phone } = req.body;

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

  const codeRegex = /^[A-Za-z0-9\-]{2,10}$/;
  if (!codeRegex.test(branch_code)) {
    return res.status(400).json({ 
      success: false, 
      message: "Branch code must be 2-10 alphanumeric characters (hyphens allowed)." 
    });
  }

  if (contact_email && contact_email.trim() !== "") {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(contact_email)) {
      return res.status(400).json({ success: false, message: "Invalid contact email format." });
    }
  }

  next();
};

export const checkBranchDuplicates = async (req, res, next) => {
  try {
    const branchName = req.body.branch_name?.trim();
    const branchCode = req.body.branch_code?.trim();
    const excludeDbId = req.params.id || null;

    if (!branchName && !branchCode) return next();

    const query = { $or: [] };
    if (branchName) query.$or.push({ branch_name: new RegExp(`^${branchName}$`, "i") });
    if (branchCode) query.$or.push({ branch_code: new RegExp(`^${branchCode}$`, "i") });

    if (excludeDbId) query._id = { $ne: excludeDbId };

    if (query.$or.length > 0) {
      const existing = await Branch.findOne(query).select("branch_name branch_code");
      if (existing) {
        return res.status(400).json({ 
          success: false, 
          message: "Branch Name or Code already exists in the system." 
        });
      }
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Error validating branch duplicates." });
  }
};

export const processBranchPayload = (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (payload.branch_name) payload.branch_name = payload.branch_name.trim();
    if (payload.branch_code) payload.branch_code = payload.branch_code.trim().toUpperCase();
    if (payload.address) payload.address = payload.address.trim();
    if (payload.contact_phone) payload.contact_phone = payload.contact_phone.trim();
    if (payload.contact_email) payload.contact_email = payload.contact_email.trim().toLowerCase();

    if (payload.is_active !== undefined) {
      payload.is_active = payload.is_active === "true" || payload.is_active === true;
    }

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) delete payload[key];
    });

    req.body = payload;
    next();
  } catch (error) {
    res.status(400).json({ success: false, message: "Error processing branch payload." });
  }
};