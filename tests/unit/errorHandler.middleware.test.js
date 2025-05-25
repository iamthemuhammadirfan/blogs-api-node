const { errorHandler } = require("../../src/middleware/errorHandler");

describe("Error Handler Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("Development Environment", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "development";
    });

    it("should return 500 status for generic error", () => {
      const error = new Error("Test error");

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it("should include stack trace in development", () => {
      const error = new Error("Test error");

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Test error",
        stack: error.stack,
      });
    });

    it("should use custom status code if provided", () => {
      const error = new Error("Custom error");
      error.statusCode = 400;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("Production Environment", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "production";
    });

    afterEach(() => {
      process.env.NODE_ENV = "test";
    });

    it("should not include stack trace in production", () => {
      const error = new Error("Test error");

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Test error",
      });
    });

    it("should return generic message for 500 errors in production", () => {
      const error = new Error("Internal server error");

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal server error",
      });
    });
  });

  describe("MongoDB Errors", () => {
    it("should handle duplicate key error (11000)", () => {
      const error = {
        code: 11000,
        keyPattern: { email: 1 },
        keyValue: { email: "test@example.com" },
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Duplicate field value entered",
      });
    });

    it("should handle validation error", () => {
      const error = {
        name: "ValidationError",
        errors: {
          name: { message: "Name is required" },
          email: { message: "Email is invalid" },
        },
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Name is required, Email is invalid",
      });
    });

    it("should handle cast error", () => {
      const error = {
        name: "CastError",
        path: "_id",
        value: "invalid-id",
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Resource not found",
      });
    });
  });

  describe("Custom Error Handling", () => {
    it("should preserve custom error messages", () => {
      const error = new Error("Custom validation failed");
      error.statusCode = 422;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Custom validation failed",
      });
    });

    it("should handle errors without message", () => {
      const error = {};

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server Error",
      });
    });

    it("should handle null or undefined errors", () => {
      errorHandler(null, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server Error",
      });
    });
  });

  describe("Error Response Format", () => {
    it("should always return success: false", () => {
      const error = new Error("Any error");

      errorHandler(error, req, res, next);

      const callArgs = res.json.mock.calls[0][0];
      expect(callArgs.success).toBe(false);
    });

    it("should always include message field", () => {
      const error = new Error("Test message");

      errorHandler(error, req, res, next);

      const callArgs = res.json.mock.calls[0][0];
      expect(callArgs.message).toBeDefined();
      expect(typeof callArgs.message).toBe("string");
    });

    it("should not call next after handling error", () => {
      const error = new Error("Test error");

      errorHandler(error, req, res, next);

      expect(next).not.toHaveBeenCalled();
    });
  });
});
