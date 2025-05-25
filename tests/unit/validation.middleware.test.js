// Mock express-validator
jest.mock("express-validator", () => ({
  body: jest.fn(() => ({
    notEmpty: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    isEmail: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    isBoolean: jest.fn().mockReturnThis(),
    isArray: jest.fn().mockReturnThis(),
    isString: jest.fn().mockReturnThis(),
    isInt: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
  })),
  param: jest.fn(() => ({
    isLength: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
  })),
  query: jest.fn(() => ({
    optional: jest.fn().mockReturnThis(),
    isInt: jest.fn().mockReturnThis(),
    isString: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
  })),
  validationResult: jest.fn(),
}));

const { validationResult } = require("express-validator");
const {
  validateUser,
  validateBlog,
  validateBlogUpdate,
  handleValidation,
} = require("../../src/middleware/validation");

describe("Validation Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("handleValidation", () => {
    it("should call next() when no validation errors", () => {
      validationResult.mockReturnValue({
        isEmpty: () => true,
      });

      handleValidation(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 400 with errors when validation fails", () => {
      const mockErrors = [
        {
          type: "field",
          msg: "Name is required",
          path: "name",
          location: "body",
        },
        {
          type: "field",
          msg: "Email is invalid",
          path: "email",
          location: "body",
        },
      ];

      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors,
      });

      handleValidation(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Validation failed",
        errors: mockErrors,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should format validation errors correctly", () => {
      const mockErrors = [
        {
          type: "field",
          msg: "Name must be at least 2 characters long",
          path: "name",
          location: "body",
          value: "a",
        },
      ];

      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors,
      });

      handleValidation(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Validation failed",
        errors: mockErrors,
      });
    });
  });

  describe("Validation Arrays", () => {
    it("should export validateUser as an array", () => {
      expect(Array.isArray(validateUser)).toBe(true);
      expect(validateUser.length).toBeGreaterThan(0);
    });

    it("should export validateBlog as an array", () => {
      expect(Array.isArray(validateBlog)).toBe(true);
      expect(validateBlog.length).toBeGreaterThan(0);
    });

    it("should export validateBlogUpdate as an array", () => {
      expect(Array.isArray(validateBlogUpdate)).toBe(true);
      expect(validateBlogUpdate.length).toBeGreaterThan(0);
    });

    it("should include handleValidation in validation arrays", () => {
      expect(validateUser).toContain(handleValidation);
      expect(validateBlog).toContain(handleValidation);
      expect(validateBlogUpdate).toContain(handleValidation);
    });
  });

  describe("Error Response Format", () => {
    it("should return consistent error response structure", () => {
      const mockErrors = [
        {
          type: "field",
          msg: "Test error message",
          path: "testField",
          location: "body",
        },
      ];

      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors,
      });

      handleValidation(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Validation failed",
        errors: mockErrors,
      });
    });

    it("should handle empty errors array", () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [],
      });

      handleValidation(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Validation failed",
        errors: [],
      });
    });
  });

  describe("Integration with Express Validator", () => {
    it("should call validationResult with request object", () => {
      validationResult.mockReturnValue({
        isEmpty: () => true,
      });

      handleValidation(req, res, next);

      expect(validationResult).toHaveBeenCalledWith(req);
    });

    it("should handle validation result correctly", () => {
      const mockResult = {
        isEmpty: jest.fn(() => false),
        array: jest.fn(() => []),
      };

      validationResult.mockReturnValue(mockResult);

      handleValidation(req, res, next);

      expect(mockResult.isEmpty).toHaveBeenCalled();
      expect(mockResult.array).toHaveBeenCalled();
    });
  });
});
