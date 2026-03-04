export const branchGuard = (req, res, next) => {
  // 1. Super Admins can see all branches if they pass a 'global' query
  if (req.user.role === "superadmin" && req.query.global === "true") {
    req.branchFilter = {}; // No filter applied
    return next();
  }

  // 2. Standard users (Instructor/Registrar/Staff) are locked to their own branch
  if (!req.user.branch) {
    return res.status(403).json({ message: "User is not assigned to a branch." });
  }

  req.branchFilter = { branch: req.user.branch };
  next();
};