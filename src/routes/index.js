const { Router } = require("express");
const blogRoutes = require("./blogRoutes");
const userRoutes = require("./userRoutes");

const router = Router();

// Mount routes
router.use("/blogs", blogRoutes);
router.use("/users", userRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running successfully",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

module.exports = router;
