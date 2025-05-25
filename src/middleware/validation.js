const { body, param, query, validationResult } = require("express-validator");

/**
 * Handle validation errors
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  next();
};

/**
 * User validation rules
 */
const validateUser = [
  body("first_name")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ max: 50 })
    .withMessage("First name cannot exceed 50 characters"),

  body("last_name")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ max: 50 })
    .withMessage("Last name cannot exceed 50 characters"),

  body("email").isEmail().withMessage("Please provide a valid email"),

  body("bio")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),

  body("profile_pic_url")
    .optional()
    .isLength({ min: 1 })
    .withMessage("Profile picture URL cannot be empty"),

  handleValidation,
];

/**
 * Blog validation rules
 */
const validateBlog = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),

  body("sub_title")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Subtitle cannot exceed 300 characters"),

  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 10 })
    .withMessage("Content must be at least 10 characters long"),

  body("tags").optional().isArray().withMessage("Tags must be an array"),

  body("author").notEmpty().withMessage("Author is required"),

  handleValidation,
];

/**
 * Blog update validation rules
 */
const validateBlogUpdate = [
  body("title")
    .optional()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),

  body("sub_title")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Subtitle cannot exceed 300 characters"),

  body("content")
    .optional()
    .notEmpty()
    .withMessage("Content cannot be empty")
    .isLength({ min: 10 })
    .withMessage("Content must be at least 10 characters long"),

  body("tags").optional().isArray().withMessage("Tags must be an array"),

  handleValidation,
];

/**
 * ID parameter validation
 */
const validateId = [
  param("id").isLength({ min: 24, max: 24 }).withMessage("Invalid ID format"),

  handleValidation,
];

/**
 * Query parameter validation for pagination
 */
const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("tags").optional().isString().withMessage("Tags must be a string"),

  handleValidation,
];

module.exports = {
  validateUser,
  validateBlog,
  validateBlogUpdate,
  validateId,
  validatePagination,
  handleValidation,
  // Aliases for backward compatibility
  validateCreateUser: validateUser,
  validateUpdateUser: validateUser,
  validateCreateBlog: validateBlog,
  validateUpdateBlog: validateBlogUpdate,
  validateBlogId: validateId,
  validateBlogQuery: validatePagination,
  handleValidationErrors: handleValidation,
};
