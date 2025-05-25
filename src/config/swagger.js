const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Blog API",
      version: "1.0.0",
      description:
        "A complete blog application backend API built with Node.js, Express, and MongoDB",
      contact: {
        name: "Muhammad Irfan",
        email: "contact@example.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Development server",
      },
    ],
    tags: [
      {
        name: "Blogs",
        description: "Blog management endpoints",
      },
      {
        name: "Users",
        description: "User management endpoints",
      },
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          required: ["first_name", "email"],
          properties: {
            _id: {
              type: "string",
              description: "Auto-generated unique identifier",
            },
            first_name: {
              type: "string",
              description: "User first name",
              example: "John",
            },
            last_name: {
              type: "string",
              description: "User last name",
              example: "Doe",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "john.doe@example.com",
            },
            bio: {
              type: "string",
              description: "User biography",
              example: "Software developer passionate about technology",
            },
            created_date: {
              type: "string",
              format: "date-time",
              description: "User creation date",
            },
            modified_date: {
              type: "string",
              format: "date-time",
              description: "User last modification date",
            },
          },
        },
        Blog: {
          type: "object",
          required: ["title", "content", "author"],
          properties: {
            _id: {
              type: "string",
              description: "Auto-generated unique identifier",
            },
            title: {
              type: "string",
              maxLength: 200,
              description: "Blog post title",
              example: "Getting Started with Node.js",
            },
            sub_title: {
              type: "string",
              maxLength: 300,
              description: "Blog post subtitle",
              example: "A comprehensive guide for beginners",
            },
            content: {
              type: "string",
              minLength: 10,
              description: "Blog post content",
              example:
                "This is a comprehensive guide to getting started with Node.js...",
            },
            slug: {
              type: "string",
              description: "URL-friendly version of the title",
              example: "getting-started-with-node-js",
            },
            tags: {
              type: "array",
              items: {
                type: "string",
                maxLength: 30,
              },
              description: "Array of tags associated with the blog post",
              example: ["nodejs", "javascript", "backend"],
            },
            author: {
              type: "string",
              description: "Author user ID (ObjectId)",
              example: "507f1f77bcf86cd799439011",
            },
            isPublished: {
              type: "boolean",
              default: false,
              description: "Whether the blog post is published",
            },
            views: {
              type: "number",
              default: 0,
              description: "Number of views",
            },
            created_date: {
              type: "string",
              format: "date-time",
              description: "Blog creation date",
            },
            modified_date: {
              type: "string",
              format: "date-time",
              description: "Blog last modification date",
            },
          },
        },
        CreateUserRequest: {
          type: "object",
          required: ["first_name", "email"],
          properties: {
            first_name: {
              type: "string",
              description: "User first name",
              example: "John",
            },
            last_name: {
              type: "string",
              description: "User last name",
              example: "Doe",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "john.doe@example.com",
            },
            bio: {
              type: "string",
              description: "User biography",
              example: "Software developer passionate about technology",
            },
          },
        },
        CreateBlogRequest: {
          type: "object",
          required: ["title", "content", "author"],
          properties: {
            title: {
              type: "string",
              maxLength: 200,
              description: "Blog post title",
              example: "Getting Started with Node.js",
            },
            sub_title: {
              type: "string",
              maxLength: 300,
              description: "Blog post subtitle",
              example: "A comprehensive guide for beginners",
            },
            content: {
              type: "string",
              minLength: 10,
              description: "Blog post content",
              example:
                "This is a comprehensive guide to getting started with Node.js...",
            },
            tags: {
              type: "array",
              items: {
                type: "string",
                maxLength: 30,
              },
              description: "Array of tags associated with the blog post",
              example: ["nodejs", "javascript", "backend"],
            },
            author: {
              type: "string",
              description: "Author user ID (ObjectId)",
              example: "507f1f77bcf86cd799439011",
            },
            isPublished: {
              type: "boolean",
              default: false,
              description: "Whether the blog post is published",
            },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              type: "object",
              description: "Response data",
            },
            message: {
              type: "string",
              description: "Optional success message",
            },
          },
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: {
                type: "object",
              },
            },
            pagination: {
              type: "object",
              properties: {
                current_page: {
                  type: "number",
                  example: 1,
                },
                total_pages: {
                  type: "number",
                  example: 5,
                },
                total_items: {
                  type: "number",
                  example: 50,
                },
                items_per_page: {
                  type: "number",
                  example: 10,
                },
                has_next: {
                  type: "boolean",
                  example: true,
                },
                has_prev: {
                  type: "boolean",
                  example: false,
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  description: "Error description",
                },
                code: {
                  type: "string",
                  description: "Error code",
                },
                details: {
                  type: "object",
                  description: "Additional error details",
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js", "./src/models/*.js"],
};

const specs = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  specs,
};
