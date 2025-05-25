// Mock dependencies first
jest.mock("../../src/models");
jest.mock("../../src/utils/responseHelpers");

// Import after mocking
const { sampleUsers, sampleBlogs } = require("../fixtures/testData");
const { BlogController } = require("../../src/controllers/blogController");
const { Blog } = require("../../src/models");
const responseHelpers = require("../../src/utils/responseHelpers");

// Setup mock implementations
beforeAll(() => {
  // Setup validatePaginationParams mock
  responseHelpers.validatePaginationParams.mockImplementation((page, limit) => {
    const pageNum = parseInt(page || "1", 10);
    const limitNum = parseInt(limit || "10", 10);
    return {
      page: pageNum,
      limit: limitNum,
      skip: (pageNum - 1) * limitNum,
    };
  });

  // Setup parseTags mock
  responseHelpers.parseTags.mockImplementation((tagsQuery) => {
    if (!tagsQuery) return [];
    return tagsQuery.split(",").map((tag) => tag.trim());
  });

  // Setup other mocks
  responseHelpers.formatBlogResponse.mockImplementation((blog) => blog);
  responseHelpers.createPaginatedResponse.mockImplementation(
    (data, page, limit, total) => ({
      data,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit,
        has_next: page < Math.ceil(total / limit),
        has_prev: page > 1,
      },
    })
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
});

// Mock middleware
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

describe("Blog Controller", () => {
  let req, res, next;
  let testUser, testBlog;

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

    testBlog = {
      _id: "507f1f77bcf86cd799439012",
      ...sampleBlogs[0],
      author: testUser._id,
      save: jest.fn(),
      populate: jest.fn().mockReturnThis(),
    };
  });

  describe("getBlogs", () => {
    it("should return all blogs with pagination", async () => {
      const mockBlogs = [testBlog, { ...testBlog, _id: "different-id" }];
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockBlogs),
      };

      // Ensure validatePaginationParams returns a proper object
      responseHelpers.validatePaginationParams.mockReturnValue({
        page: 1,
        limit: 10,
        skip: 0,
      });

      // Ensure parseTags returns empty array for no tags
      responseHelpers.parseTags.mockReturnValue([]);

      // Mock Blog methods - IMPORTANT: countDocuments is called first
      Blog.countDocuments.mockResolvedValue(2);
      Blog.find.mockReturnValue(mockQuery);

      req.query = { page: "1", limit: "10" };

      await BlogController.getBlogs(req, res, next);

      expect(responseHelpers.validatePaginationParams).toHaveBeenCalledWith(
        "1",
        "10"
      );
      expect(responseHelpers.parseTags).toHaveBeenCalledWith(undefined);
      expect(Blog.countDocuments).toHaveBeenCalledWith({});
      expect(Blog.find).toHaveBeenCalledWith({});
      expect(mockQuery.populate).toHaveBeenCalledWith(
        "author",
        "first_name last_name bio profile_pic_url"
      );
      expect(mockQuery.sort).toHaveBeenCalledWith({ created_date: -1 });
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.lean).toHaveBeenCalled();
      expect(responseHelpers.sendSuccessResponse).toHaveBeenCalled();
    });

    it("should filter blogs by tags when provided", async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([testBlog]),
      };

      // Ensure validatePaginationParams returns a proper object
      responseHelpers.validatePaginationParams.mockReturnValue({
        page: 1,
        limit: 10,
        skip: 0,
      });

      // Mock parseTags to return proper tags
      responseHelpers.parseTags.mockReturnValue(["nodejs", "javascript"]);

      // Mock Blog methods - countDocuments called first
      Blog.countDocuments.mockResolvedValue(1);
      Blog.find.mockReturnValue(mockQuery);

      req.query = { tags: "nodejs,javascript" };

      await BlogController.getBlogs(req, res, next);

      expect(responseHelpers.parseTags).toHaveBeenCalledWith(
        "nodejs,javascript"
      );
      expect(Blog.countDocuments).toHaveBeenCalledWith({
        tags: { $in: ["nodejs", "javascript"] },
      });
      expect(Blog.find).toHaveBeenCalledWith({
        tags: { $in: ["nodejs", "javascript"] },
      });
      expect(responseHelpers.sendSuccessResponse).toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      // Ensure validatePaginationParams returns a proper object
      responseHelpers.validatePaginationParams.mockReturnValue({
        page: 1,
        limit: 10,
        skip: 0,
      });

      responseHelpers.parseTags.mockReturnValue([]);

      // Mock Blog.countDocuments to throw an error
      const error = new Error("Database error");
      Blog.countDocuments.mockRejectedValue(error);

      await BlogController.getBlogs(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Failed to fetch blogs",
          statusCode: 500,
          code: "FETCH_ERROR",
        })
      );
    });

    it("should use default pagination values", async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };

      // Return default pagination values
      responseHelpers.validatePaginationParams.mockReturnValue({
        page: 1,
        limit: 10,
        skip: 0,
      });

      responseHelpers.parseTags.mockReturnValue([]);

      // Mock Blog methods - countDocuments called first
      Blog.countDocuments.mockResolvedValue(0);
      Blog.find.mockReturnValue(mockQuery);

      // No pagination params in query
      req.query = {};

      await BlogController.getBlogs(req, res, next);

      expect(responseHelpers.validatePaginationParams).toHaveBeenCalledWith(
        undefined,
        undefined
      );
      expect(responseHelpers.parseTags).toHaveBeenCalledWith(undefined);
      expect(Blog.countDocuments).toHaveBeenCalledWith({});
      expect(mockQuery.limit).toHaveBeenCalledWith(10); // Default limit
      expect(mockQuery.skip).toHaveBeenCalledWith(0); // Default skip
      expect(responseHelpers.sendSuccessResponse).toHaveBeenCalled();
    });
  });

  describe("getBlogById", () => {
    it("should return a blog by ID", async () => {
      const mockPopulatedBlog = {
        ...testBlog,
        save: jest.fn().mockResolvedValue(testBlog),
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockPopulatedBlog),
      };

      Blog.findById.mockReturnValue(mockQuery);

      req.params.id = testBlog._id;

      await BlogController.getBlogById(req, res, next);

      expect(Blog.findById).toHaveBeenCalledWith(testBlog._id);
      expect(mockQuery.populate).toHaveBeenCalledWith(
        "author",
        "first_name last_name bio profile_pic_url"
      );
      expect(mockQuery.lean).toHaveBeenCalled();
    });

    it("should return 404 when blog not found", async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      };

      Blog.findById.mockReturnValue(mockQuery);

      req.params.id = "non-existent-id";

      await BlogController.getBlogById(req, res, next);

      // Should call next with AppError for 404
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Blog not found",
          statusCode: 404,
          code: "BLOG_NOT_FOUND",
        })
      );
    });

    it("should handle database errors", async () => {
      const error = new Error("Database error");
      Blog.findById.mockImplementation(() => {
        throw error;
      });

      req.params.id = testBlog._id;

      await BlogController.getBlogById(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Failed to fetch blog",
          statusCode: 500,
          code: "FETCH_ERROR",
        })
      );
    });
  });

  describe("createBlog", () => {
    it("should create a new blog successfully", async () => {
      const blogData = {
        title: "New Blog",
        content: "New content",
        author: testUser._id,
        tags: ["test"],
      };

      const savedBlog = { ...testBlog, _id: "new-blog-id" };
      const mockSave = jest.fn().mockResolvedValue(savedBlog);
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(savedBlog),
      };

      // Mock Blog constructor and save method
      Blog.mockImplementation(() => ({
        save: mockSave,
      }));
      Blog.findById.mockReturnValue(mockQuery);

      req.body = blogData;

      await BlogController.createBlog(req, res, next);

      expect(Blog).toHaveBeenCalledWith(blogData);
      expect(mockSave).toHaveBeenCalled();
      expect(Blog.findById).toHaveBeenCalledWith("new-blog-id");
    });

    it("should handle validation errors", async () => {
      const error = new Error("Validation failed");
      error.name = "ValidationError";

      const mockSave = jest.fn().mockRejectedValue(error);
      Blog.mockImplementation(() => ({
        save: mockSave,
      }));

      req.body = { title: "", content: "Content" };

      await BlogController.createBlog(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Failed to create blog",
          statusCode: 500,
          code: "CREATE_ERROR",
        })
      );
    });

    it("should handle duplicate key errors", async () => {
      const error = new Error("Duplicate key");
      error.code = 11000;

      const mockSave = jest.fn().mockRejectedValue(error);
      Blog.mockImplementation(() => ({
        save: mockSave,
      }));

      req.body = sampleBlogs[0];

      await BlogController.createBlog(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Failed to create blog",
          statusCode: 500,
          code: "CREATE_ERROR",
        })
      );
    });
  });

  describe("updateBlog", () => {
    it("should update a blog successfully", async () => {
      const updateData = {
        title: "Updated Title",
        content: "Updated content",
      };

      const updatedBlog = { ...testBlog, ...updateData };
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(updatedBlog),
      };

      Blog.findByIdAndUpdate.mockReturnValue(mockQuery);

      req.params.id = testBlog._id;
      req.body = updateData;

      await BlogController.updateBlog(req, res, next);

      expect(Blog.findByIdAndUpdate).toHaveBeenCalledWith(
        testBlog._id,
        updateData,
        { new: true, runValidators: true }
      );
      expect(mockQuery.populate).toHaveBeenCalledWith(
        "author",
        "first_name last_name bio profile_pic_url"
      );
      expect(mockQuery.lean).toHaveBeenCalled();
    });

    it("should return 404 when blog not found for update", async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      };

      Blog.findByIdAndUpdate.mockReturnValue(mockQuery);

      req.params.id = "non-existent-id";
      req.body = { title: "Updated Title" };

      await BlogController.updateBlog(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Blog not found",
          statusCode: 404,
          code: "BLOG_NOT_FOUND",
        })
      );
    });

    it("should handle validation errors during update", async () => {
      const error = new Error("Validation failed");
      error.name = "ValidationError";

      Blog.findByIdAndUpdate.mockImplementation(() => {
        throw error;
      });

      req.params.id = testBlog._id;
      req.body = { title: "Valid Title", content: "Valid content" }; // Valid data

      await BlogController.updateBlog(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Failed to update blog",
          statusCode: 500,
          code: "UPDATE_ERROR",
        })
      );
    });
  });

  describe("deleteBlog", () => {
    it("should delete a blog successfully", async () => {
      Blog.findByIdAndDelete.mockResolvedValue(testBlog);

      req.params.id = testBlog._id;

      await BlogController.deleteBlog(req, res, next);

      expect(Blog.findByIdAndDelete).toHaveBeenCalledWith(testBlog._id);
      const {
        sendSuccessResponse,
      } = require("../../src/utils/responseHelpers");
      expect(sendSuccessResponse).toHaveBeenCalledWith(
        res,
        null,
        "Blog deleted successfully"
      );
    });

    it("should return 404 when blog not found for deletion", async () => {
      Blog.findByIdAndDelete.mockResolvedValue(null);

      req.params.id = "non-existent-id";

      await BlogController.deleteBlog(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Blog not found",
          statusCode: 404,
          code: "BLOG_NOT_FOUND",
        })
      );
    });

    it("should handle database errors during deletion", async () => {
      const error = new Error("Database error");
      Blog.findByIdAndDelete.mockRejectedValue(error);

      req.params.id = testBlog._id;

      await BlogController.deleteBlog(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Failed to delete blog",
          statusCode: 500,
          code: "DELETE_ERROR",
        })
      );
    });
  });
});
