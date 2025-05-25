const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");

const { connectDatabase } = require("./config/database");
const { swaggerUi, specs } = require("./config/swagger");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middleware");

// Load environment variables
dotenv.config();

class App {
  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || "3000", 10);

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  initializeMiddlewares() {
    // Security middleware
    this.app.use(helmet());

    // CORS middleware
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      })
    );

    // Logging middleware
    if (process.env.NODE_ENV === "development") {
      this.app.use(morgan("dev"));
    } else {
      this.app.use(morgan("combined"));
    }

    // Body parsing middleware
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Request timeout middleware
    this.app.use((req, res, next) => {
      res.setTimeout(30000, () => {
        res.status(408).json({
          error: {
            message: "Request timeout",
            code: "REQUEST_TIMEOUT",
          },
        });
      });
      next();
    });
  }

  initializeRoutes() {
    // Swagger documentation
    this.app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(specs, {
        explorer: true,
        customCss: ".swagger-ui .topbar { display: none }",
        customSiteTitle: "Blog API Documentation",
      })
    );

    // API routes
    this.app.use(process.env.API_PREFIX || "/api", routes);

    // Root endpoint
    this.app.get("/", (req, res) => {
      res.status(200).json({
        success: true,
        message: "Blog API Server is running",
        version: "1.0.0",
        documentation: "/api-docs",
        api: "/api",
        timestamp: new Date().toISOString(),
      });
    });
  }

  initializeErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  async start() {
    try {
      // Connect to database
      await connectDatabase();

      // Start server
      this.app.listen(this.port, () => {
        console.log(`
🚀 Server is running successfully!
🌍 Environment: ${process.env.NODE_ENV || "development"}
🔗 Local URL: http://localhost:${this.port}
📚 API Base URL: http://localhost:${this.port}${
          process.env.API_PREFIX || "/api"
        }
📋 API Documentation: http://localhost:${this.port}/api-docs
🏥 Health Check: http://localhost:${this.port}${
          process.env.API_PREFIX || "/api"
        }/health
📖 Blogs API: http://localhost:${this.port}${
          process.env.API_PREFIX || "/api"
        }/blogs
👥 Users API: http://localhost:${this.port}${
          process.env.API_PREFIX || "/api"
        }/users
        `);
      });

      // Graceful shutdown handlers
      process.on("SIGTERM", this.gracefulShutdown.bind(this));
      process.on("SIGINT", this.gracefulShutdown.bind(this));
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  }

  gracefulShutdown(signal) {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    const server = this.app.listen();
    server.close((err) => {
      if (err) {
        console.error("Error during server shutdown:", err);
        process.exit(1);
      }

      console.log("Server closed successfully");
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error("Forced shutdown due to timeout");
      process.exit(1);
    }, 10000);
  }
}

module.exports = App;
