// Mock dependencies first
jest.mock("../../src/models");
jest.mock("../../src/utils/responseHelpers");

// Import after mocking
const { UserController } = require("../../src/controllers/userController");
const { User } = require("../../src/models");
const { sampleUsers } = require("../fixtures/testData");
const responseHelpers = require("../../src/utils/responseHelpers");

// Mock the middleware
jest.mock("../../src/middleware", () => ({
  asyncHandler: (fn) => async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  },
  AppError: class AppError extends Error {
    constructor(message, statusCode, code) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
    }
  },
}));

describe("User Controller", () => {
  let req, res, next;
  let testUser;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();

    // Setup test data
    testUser = {
      _id: "507f1f77bcf86cd799439011",
      ...sampleUsers[0],
    };

    // Setup User model mocks
    User.find = jest.fn();
    User.findById = jest.fn();
    User.findByIdAndUpdate = jest.fn();
    User.findByIdAndDelete = jest.fn();
    User.countDocuments = jest.fn();

    // Setup User constructor mock as a proper jest mock function
    User.mockClear();

    // Re-setup response helper mocks after clearing
    responseHelpers.validatePaginationParams.mockImplementation(
      (page, limit) => {
        const pageNum = parseInt(page || "1", 10);
        const limitNum = parseInt(limit || "10", 10);

        const validatedPage = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
        const validatedLimit =
          isNaN(limitNum) || limitNum < 1 || limitNum > 100 ? 10 : limitNum;

        return {
          page: validatedPage,
          limit: validatedLimit,
          skip: (validatedPage - 1) * validatedLimit,
        };
      }
    );

    responseHelpers.sendSuccessResponse.mockImplementation(
      (res, data, message, statusCode = 200) => {
        return res.status(statusCode).json({
          success: true,
          data,
          ...(message && { message }),
        });
      }
    );

    responseHelpers.sendErrorResponse.mockImplementation(
      (res, message, code, statusCode = 400, details) => {
        return res.status(statusCode).json({
          error: {
            message,
            code,
            details,
          },
        });
      }
    );

    responseHelpers.createPaginatedResponse.mockImplementation(
      (data, page, limit, total) => ({
        data,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalCount: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      })
    );
  });

  describe("getUsers", () => {
    it("should return all users with pagination", async () => {
      const mockUsers = [testUser, { ...testUser, _id: "different-id" }];

      // Mock the query chain
      const leanMock = jest.fn().mockResolvedValue(mockUsers);
      const limitMock = jest.fn().mockReturnValue({ lean: leanMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });
      const selectMock = jest.fn().mockReturnValue({ sort: sortMock });

      User.find = jest.fn().mockReturnValue({ select: selectMock });
      User.countDocuments = jest.fn().mockResolvedValue(2);

      req.query = { page: "1", limit: "10" };

      await UserController.getUsers(req, res, next);

      expect(User.find).toHaveBeenCalled();
      expect(selectMock).toHaveBeenCalledWith("-__v");
      expect(sortMock).toHaveBeenCalledWith({ created_date: -1 });
      expect(skipMock).toHaveBeenCalledWith(0);
      expect(limitMock).toHaveBeenCalledWith(10);
      expect(leanMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should handle database errors", async () => {
      const error = new Error("Database error");
      User.countDocuments = jest.fn().mockRejectedValue(error);

      await UserController.getUsers(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Failed to fetch users",
          statusCode: 500,
          code: "FETCH_ERROR",
        })
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should use default pagination values", async () => {
      const mockUsers = [];

      // Mock the query chain
      const leanMock = jest.fn().mockResolvedValue(mockUsers);
      const limitMock = jest.fn().mockReturnValue({ lean: leanMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });
      const selectMock = jest.fn().mockReturnValue({ sort: sortMock });

      User.find = jest.fn().mockReturnValue({ select: selectMock });
      User.countDocuments = jest.fn().mockResolvedValue(0);

      // Don't set any query params to test defaults
      req.query = {};

      await UserController.getUsers(req, res, next);

      expect(limitMock).toHaveBeenCalledWith(10); // Default limit
      expect(skipMock).toHaveBeenCalledWith(0); // Default skip
    });
  });

  describe("getUserById", () => {
    it("should return a user by ID", async () => {
      // Mock the query chain for findById
      const leanMock = jest.fn().mockResolvedValue(testUser);
      const selectMock = jest.fn().mockReturnValue({ lean: leanMock });

      User.findById = jest.fn().mockReturnValue({ select: selectMock });

      req.params.id = testUser._id;

      await UserController.getUserById(req, res, next);

      expect(User.findById).toHaveBeenCalledWith(testUser._id);
      expect(selectMock).toHaveBeenCalledWith("-__v");
      expect(leanMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 when user not found", async () => {
      // Mock the query chain that returns null (user not found)
      const leanMock = jest.fn().mockResolvedValue(null);
      const selectMock = jest.fn().mockReturnValue({ lean: leanMock });

      User.findById = jest.fn().mockReturnValue({ select: selectMock });

      req.params.id = "non-existent-id";

      await UserController.getUserById(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User not found",
          statusCode: 404,
          code: "USER_NOT_FOUND",
        })
      );
    });

    it("should handle database errors", async () => {
      const error = new Error("Database error");

      // Mock the query chain to throw an error
      const selectMock = jest.fn().mockImplementation(() => {
        throw error;
      });

      User.findById = jest.fn().mockReturnValue({ select: selectMock });

      req.params.id = testUser._id;

      await UserController.getUserById(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Failed to fetch user",
          statusCode: 500,
          code: "FETCH_ERROR",
        })
      );
    });
  });

  describe("createUser", () => {
    it("should create a new user successfully", async () => {
      const userData = {
        first_name: "New",
        last_name: "User",
        email: "newuser@example.com",
        bio: "New user bio",
      };

      const mockSavedUser = {
        _id: "new-user-id",
        ...userData,
        __v: 0,
        toObject: jest
          .fn()
          .mockReturnValue({ _id: "new-user-id", ...userData, __v: 0 }),
      };

      // Mock the User constructor and save method
      const saveMock = jest.fn().mockResolvedValue(mockSavedUser);
      User.mockImplementation(() => ({
        ...userData,
        save: saveMock,
      }));

      req.body = userData;

      await UserController.createUser(req, res, next);

      expect(User).toHaveBeenCalledWith(userData);
      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should handle validation errors", async () => {
      const error = new Error("Validation failed");
      error.name = "ValidationError";

      // Mock the User constructor and save method to throw error
      const saveMock = jest.fn().mockRejectedValue(error);
      User.mockImplementation(() => ({
        save: saveMock,
      }));

      req.body = { name: "", email: "invalid-email" };

      await UserController.createUser(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Failed to create user",
          statusCode: 500,
          code: "CREATE_ERROR",
        })
      );
    });

    it("should handle duplicate email errors", async () => {
      const error = new Error("Duplicate key");
      error.code = 11000;

      // Mock the User constructor and save method to throw duplicate error
      const saveMock = jest.fn().mockRejectedValue(error);
      User.mockImplementation(() => ({
        save: saveMock,
      }));

      req.body = sampleUsers[0];

      await UserController.createUser(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Failed to create user",
          statusCode: 500,
          code: "CREATE_ERROR",
        })
      );
    });
  });

  describe("updateUser", () => {
    it("should update a user by ID successfully", async () => {
      const updateData = {
        first_name: "Updated",
        bio: "Updated bio",
      };

      const updatedUser = { ...testUser, ...updateData };

      // Mock the query chain for findByIdAndUpdate
      const leanMock = jest.fn().mockResolvedValue(updatedUser);
      const selectMock = jest.fn().mockReturnValue({ lean: leanMock });

      User.findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({ select: selectMock });

      req.params.id = testUser._id;
      req.body = updateData;

      await UserController.updateUser(req, res, next);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        testUser._id,
        updateData,
        { new: true, runValidators: true }
      );
      expect(selectMock).toHaveBeenCalledWith("-__v");
      expect(leanMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 when user not found for update", async () => {
      // Mock the query chain that returns null (user not found)
      const leanMock = jest.fn().mockResolvedValue(null);
      const selectMock = jest.fn().mockReturnValue({ lean: leanMock });

      User.findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({ select: selectMock });

      req.params.id = "non-existent-id";
      req.body = { first_name: "Updated Name" };

      await UserController.updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User not found",
          statusCode: 404,
          code: "USER_NOT_FOUND",
        })
      );
    });

    it("should handle validation errors during update", async () => {
      const error = new Error("Validation failed");
      error.name = "ValidationError";

      // Mock the query chain to throw an error
      const selectMock = jest.fn().mockImplementation(() => {
        throw error;
      });

      User.findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({ select: selectMock });

      req.params.id = testUser._id;
      req.body = { email: "invalid-email" };

      await UserController.updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Failed to update user",
          statusCode: 500,
          code: "UPDATE_ERROR",
        })
      );
    });
  });

  describe("deleteUser", () => {
    it("should delete a user by ID successfully", async () => {
      User.findByIdAndDelete = jest.fn().mockResolvedValue(testUser);

      req.params.id = testUser._id;

      await UserController.deleteUser(req, res, next);

      expect(User.findByIdAndDelete).toHaveBeenCalledWith(testUser._id);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 when user not found for deletion", async () => {
      User.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      req.params.id = "non-existent-id";

      await UserController.deleteUser(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User not found",
          statusCode: 404,
          code: "USER_NOT_FOUND",
        })
      );
    });

    it("should handle database errors during deletion", async () => {
      const error = new Error("Database error");
      User.findByIdAndDelete = jest.fn().mockImplementation(() => {
        throw error;
      });

      req.params.id = testUser._id;

      await UserController.deleteUser(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Failed to delete user",
          statusCode: 500,
          code: "DELETE_ERROR",
        })
      );
    });
  });
});
