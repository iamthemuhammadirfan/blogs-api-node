const { User } = require("../models");
const {
  sendSuccessResponse,
  validatePaginationParams,
  createPaginatedResponse,
} = require("../utils/responseHelpers");
const { asyncHandler, AppError } = require("../middleware");

class UserController {
  // GET /api/users
  static getUsers = asyncHandler(async (req, res) => {
    const { page: pageQuery, limit: limitQuery } = req.query;
    const { page, limit, skip } = validatePaginationParams(
      pageQuery,
      limitQuery
    );

    try {
      const total = await User.countDocuments();
      const users = await User.find()
        .select("-__v")
        .sort({ created_date: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const paginatedResponse = createPaginatedResponse(
        users,
        page,
        limit,
        total
      );
      return sendSuccessResponse(
        res,
        paginatedResponse,
        "Users retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new AppError("Failed to fetch users", 500, "FETCH_ERROR");
    }
  });

  // GET /api/users/:id
  static getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      const user = await User.findById(id).select("-__v").lean();

      if (!user) {
        throw new AppError("User not found", 404, "USER_NOT_FOUND");
      }

      return sendSuccessResponse(res, user, "User retrieved successfully");
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Error fetching user by ID:", error);
      throw new AppError("Failed to fetch user", 500, "FETCH_ERROR");
    }
  });

  // POST /api/users
  static createUser = asyncHandler(async (req, res) => {
    const userData = req.body;

    try {
      const newUser = new User(userData);
      const savedUser = await newUser.save();

      const userResponse = savedUser.toObject();
      delete userResponse.__v;

      return sendSuccessResponse(
        res,
        userResponse,
        "User created successfully",
        201
      );
    } catch (error) {
      console.error("Error creating user:", error);
      throw new AppError("Failed to create user", 500, "CREATE_ERROR");
    }
  });

  // PUT /api/users/:id
  static updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Remove empty fields
    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(
        ([_, value]) => value !== undefined && value !== ""
      )
    );

    if (Object.keys(filteredUpdateData).length === 0) {
      throw new AppError(
        "No valid fields provided for update",
        400,
        "NO_UPDATE_DATA"
      );
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(id, filteredUpdateData, {
        new: true,
        runValidators: true,
      })
        .select("-__v")
        .lean();

      if (!updatedUser) {
        throw new AppError("User not found", 404, "USER_NOT_FOUND");
      }

      return sendSuccessResponse(res, updatedUser, "User updated successfully");
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Error updating user:", error);
      throw new AppError("Failed to update user", 500, "UPDATE_ERROR");
    }
  });

  // DELETE /api/users/:id
  static deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      const deletedUser = await User.findByIdAndDelete(id);

      if (!deletedUser) {
        throw new AppError("User not found", 404, "USER_NOT_FOUND");
      }

      return sendSuccessResponse(res, null, "User deleted successfully");
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Error deleting user:", error);
      throw new AppError("Failed to delete user", 500, "DELETE_ERROR");
    }
  });
}

module.exports = { UserController };
