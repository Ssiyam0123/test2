import * as UserService from "../services/user.service.js";
import catchAsync from "../utils/catchAsync.js"; 
import ApiResponse from "../utils/ApiResponse.js";

export const getAllUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status, role, department, date_from, date_to, search } = req.query;

  const filters = { ...req.branchFilter };
  if (status && status !== "all") filters.status = status;
  if (role && role !== "all") filters.role = role;
  if (department && department !== "all") filters.department = department;

  if (date_from || date_to) {
    filters.joining_date = {};
    if (date_from) filters.joining_date.$gte = new Date(date_from);
    if (date_to) filters.joining_date.$lte = new Date(date_to);
  }

  if (search) {
    filters.$or = [
      { full_name: { $regex: search, $options: "i" } },
      { employee_id: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } }
    ];
  }

  const { users, pagination } = await UserService.fetchUsers(filters, page, limit);
  res.status(200).json(new ApiResponse(200, users, "Users fetched successfully", pagination));
});

export const getUserById = catchAsync(async (req, res) => {
  const user = await UserService.fetchUserById(req.params.id, req.branchFilter);
  res.status(200).json(new ApiResponse(200, user, "User details fetched"));
});

export const addUser = catchAsync(async (req, res) => {
  const newUser = await UserService.createUser(
    req.body, 
    req.file, 
    req.isMaster, 
    req.user.branch
  );
  res.status(201).json(new ApiResponse(201, newUser, "User created successfully"));
});

export const updateUser = catchAsync(async (req, res) => {
  const updatedUser = await UserService.modifyUser(
    req.params.id, 
    req.body, 
    req.file, 
    req.isMaster, 
    req.user.branch, 
    req.branchFilter
  );
  res.status(200).json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

export const deleteUser = catchAsync(async (req, res) => {
  await UserService.removeUser(req.params.id, req.branchFilter);
  res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
});

export const updateUserStatus = catchAsync(async (req, res) => {
  const user = await UserService.changeUserStatus(req.params.id, req.body.status, req.branchFilter);
  res.status(200).json(new ApiResponse(200, user, `User status updated to ${user.status}`));
});

export const updateUserRole = catchAsync(async (req, res) => {
  const { updatedUser, roleName } = await UserService.changeUserRole(
    req.params.id, 
    req.body.role, 
    req.isMaster, 
    req.branchFilter
  );
  res.status(200).json(new ApiResponse(200, updatedUser, `Role successfully updated to ${roleName}`));
});

export const removeUserImage = catchAsync(async (req, res) => {
  const user = await UserService.deleteUserImage(req.params.id, req.branchFilter);
  res.status(200).json(new ApiResponse(200, user, "Image removed successfully"));
});

export const searchUser = catchAsync(async (req, res) => {
  const { query } = req.query;
  const filters = {
    ...req.branchFilter,
    $or: [
      { employee_id: { $regex: query, $options: "i" } },
      { full_name: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
      { username: { $regex: query, $options: "i" } },
    ]
  };
  const { users } = await UserService.fetchUsers(filters, 1, 20);
  res.status(200).json(new ApiResponse(200, users, "Search completed", { count: users.length }));
});