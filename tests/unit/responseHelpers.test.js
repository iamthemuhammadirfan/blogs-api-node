const {
  sendSuccessResponse,
  sendErrorResponse,
  sendPaginatedResponse,
  formatBlogResponse,
  formatUserResponse,
} = require("../../src/utils/responseHelpers");

describe("Response Helpers", () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("sendSuccessResponse", () => {
    it("should send success response with data", () => {
      const testData = { id: 1, name: "Test" };
      const message = "Operation successful";

      sendSuccessResponse(res, testData, message);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: testData,
        message: message,
      });
    });

    it("should send response without message when not provided", () => {
      const testData = { id: 1 };

      sendSuccessResponse(res, testData);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: testData,
      });
    });

    it("should handle null data", () => {
      sendSuccessResponse(res, null, "No data");

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: "No data",
      });
    });

    it("should handle undefined data", () => {
      sendSuccessResponse(res, undefined, "No data");

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: undefined,
        message: "No data",
      });
    });
  });

  describe("sendErrorResponse", () => {
    it("should send error response with message and code", () => {
      const message = "Something went wrong";
      const code = "VALIDATION_ERROR";
      const statusCode = 400;

      sendErrorResponse(res, message, code, statusCode);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          message: message,
          code: code,
          details: undefined,
        },
      });
    });

    it("should use default status code 400 when not provided", () => {
      const message = "Server error";
      const code = "SERVER_ERROR";

      sendErrorResponse(res, message, code);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          message: message,
          code: code,
          details: undefined,
        },
      });
    });

    it("should handle different status codes", () => {
      const testCases = [
        { message: "Not found", code: "NOT_FOUND", statusCode: 404 },
        { message: "Unauthorized", code: "UNAUTHORIZED", statusCode: 401 },
        { message: "Forbidden", code: "FORBIDDEN", statusCode: 403 },
        {
          message: "Unprocessable Entity",
          code: "VALIDATION_ERROR",
          statusCode: 422,
        },
      ];

      testCases.forEach(({ message, code, statusCode }) => {
        sendErrorResponse(res, message, code, statusCode);
        expect(res.status).toHaveBeenCalledWith(statusCode);
      });
    });
  });

  describe("sendPaginatedResponse", () => {
    it("should send paginated response with all pagination info", () => {
      const testData = [{ id: 1 }, { id: 2 }];
      const page = 1;
      const limit = 10;
      const total = 50;
      const message = "Data retrieved";

      sendPaginatedResponse(res, testData, page, limit, total, message);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: testData,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: limit,
          has_next: page < Math.ceil(total / limit),
          has_prev: page > 1,
        },
        message: message,
      });
    });

    it("should send response without message when not provided", () => {
      const testData = [];
      const page = 1;
      const limit = 10;
      const total = 0;

      sendPaginatedResponse(res, testData, page, limit, total);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: testData,
        pagination: {
          current_page: page,
          total_pages: 0,
          total_items: total,
          items_per_page: limit,
          has_next: false,
          has_prev: false,
        },
      });
    });

    it("should handle empty data array", () => {
      const emptyData = [];

      sendPaginatedResponse(
        res,
        emptyData,
        1,
        10,
        0,
        "Data retrieved successfully"
      );

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Data retrieved successfully",
        data: emptyData,
        pagination: {
          current_page: 1,
          total_pages: 0,
          total_items: 0,
          items_per_page: 10,
          has_next: false,
          has_prev: false,
        },
      });
    });
  });

  describe("formatBlogResponse", () => {
    it("should format blog object correctly", () => {
      const mockBlog = {
        _id: "507f1f77bcf86cd799439011",
        title: "Test Blog",
        content: "Test content",
        slug: "test-blog",
        author: {
          _id: "507f1f77bcf86cd799439012",
          first_name: "John",
          last_name: "Doe",
        },
        tags: ["test", "blog"],
        created_date: new Date("2023-01-01"),
        modified_date: new Date("2023-01-02"),
      };

      const formatted = formatBlogResponse(mockBlog);

      expect(formatted).toEqual({
        _id: "507f1f77bcf86cd799439011",
        title: "Test Blog",
        content: "Test content",
        slug: "test-blog",
        author: {
          _id: "507f1f77bcf86cd799439012",
          name: "John Doe",
          slug: "john-doe",
          first_name: "John",
          last_name: "Doe",
        },
        tags: ["test", "blog"],
        isPublished: true,
        views: 0,
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2023-01-02"),
      });
    });

    it("should handle blog without author object", () => {
      const mockBlog = {
        _id: "507f1f77bcf86cd799439011",
        title: "Test Blog",
        content: "Test content",
        slug: "test-blog",
        author: "507f1f77bcf86cd799439012", // Just ID, not populated
        tags: ["test"],
        created_date: new Date(),
        modified_date: new Date(),
      };

      const formatted = formatBlogResponse(mockBlog);

      expect(formatted.author).toBe("507f1f77bcf86cd799439012");
    });

    it("should handle null or undefined blog", () => {
      expect(formatBlogResponse(null)).toBeNull();
      expect(formatBlogResponse(undefined)).toBeUndefined();
    });

    it("should preserve all required fields", () => {
      const mockBlog = {
        _id: "507f1f77bcf86cd799439011",
        title: "Test",
        content: "Content",
        slug: "test",
        author: "author-id",
        tags: [],
        created_date: new Date(),
        modified_date: new Date(),
      };

      const formatted = formatBlogResponse(mockBlog);

      expect(formatted).toHaveProperty("_id");
      expect(formatted).toHaveProperty("title");
      expect(formatted).toHaveProperty("content");
      expect(formatted).toHaveProperty("slug");
      expect(formatted).toHaveProperty("author");
      expect(formatted).toHaveProperty("tags");
      expect(formatted).toHaveProperty("isPublished");
      expect(formatted).toHaveProperty("views");
      expect(formatted).toHaveProperty("createdAt");
      expect(formatted).toHaveProperty("updatedAt");
    });
  });

  describe("formatUserResponse", () => {
    it("should format user object correctly", () => {
      const mockUser = {
        _id: "507f1f77bcf86cd799439011",
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        bio: "Test bio",
        created_date: new Date("2023-01-01"),
        modified_date: new Date("2023-01-02"),
      };

      const formatted = formatUserResponse(mockUser);

      expect(formatted).toEqual({
        _id: "507f1f77bcf86cd799439011",
        name: "John Doe",
        email: "john@example.com",
        bio: "Test bio",
        slug: "john-doe",
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2023-01-02"),
        first_name: "John",
        last_name: "Doe",
        created_date: new Date("2023-01-01"),
        modified_date: new Date("2023-01-02"),
      });
    });

    it("should handle user without bio", () => {
      const mockUser = {
        _id: "507f1f77bcf86cd799439011",
        first_name: "Jane",
        last_name: "Doe",
        email: "jane@example.com",
        created_date: new Date(),
        modified_date: new Date(),
      };

      const formatted = formatUserResponse(mockUser);

      expect(formatted.bio).toBeUndefined();
      expect(formatted.name).toBe("Jane Doe");
    });

    it("should handle null or undefined user", () => {
      expect(formatUserResponse(null)).toBeNull();
      expect(formatUserResponse(undefined)).toBeUndefined();
    });

    it("should preserve all required fields", () => {
      const mockUser = {
        _id: "507f1f77bcf86cd799439011",
        first_name: "Test",
        last_name: "User",
        email: "test@example.com",
        created_date: new Date(),
        modified_date: new Date(),
      };

      const formatted = formatUserResponse(mockUser);

      expect(formatted).toHaveProperty("_id");
      expect(formatted).toHaveProperty("name");
      expect(formatted).toHaveProperty("email");
      expect(formatted).toHaveProperty("slug");
      expect(formatted).toHaveProperty("createdAt");
      expect(formatted).toHaveProperty("updatedAt");
    });
  });
});
