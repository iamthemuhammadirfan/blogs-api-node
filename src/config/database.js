const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/SampleBlogs";

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Set up connection event listeners
    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

const disconnectDatabase = async () => {
  try {
    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error closing database connection:", error);
  }
};

module.exports = {
  connectDatabase,
  disconnectDatabase,
};
