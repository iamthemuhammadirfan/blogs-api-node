#!/usr/bin/env node

/**
 * Database Setup and Test Script
 * This script helps test MongoDB connection and seed the database
 */

const mongoose = require("mongoose");
require("dotenv").config();

const connectToDatabase = async () => {
  try {
    console.log("🔗 Attempting to connect to MongoDB...");
    console.log(
      "📍 Connection URL:",
      process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@") ||
        "Not set"
    );

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB connection successful!");
    return true;
  } catch (error) {
    console.log("❌ MongoDB connection failed:");
    console.log("   Error:", error.message);

    if (
      error.message.includes("ENOTFOUND") ||
      error.message.includes("ECONNREFUSED")
    ) {
      console.log("\n💡 Possible solutions:");
      console.log("   1. Check if MongoDB is running locally");
      console.log("   2. Verify your MONGODB_URI in .env file");
      console.log(
        "   3. For local MongoDB: brew services start mongodb/brew/mongodb-community"
      );
      console.log(
        "   4. For MongoDB Atlas: Check your connection string and network access"
      );
    }

    return false;
  }
};

const testDatabaseOperations = async () => {
  try {
    // Test basic database operations
    const testCollection = mongoose.connection.db.collection("test");

    console.log("🧪 Testing database operations...");

    // Insert test document
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    console.log("   ✅ Insert operation successful");

    // Find test document
    const doc = await testCollection.findOne({ test: true });
    console.log("   ✅ Query operation successful");

    // Clean up
    await testCollection.deleteOne({ test: true });
    console.log("   ✅ Delete operation successful");

    console.log("🎉 All database operations working correctly!");
    return true;
  } catch (error) {
    console.log("❌ Database operations failed:", error.message);
    return false;
  }
};

const checkEnvironment = () => {
  console.log("🔍 Checking environment configuration...");

  const requiredVars = ["MONGODB_URI", "PORT", "NODE_ENV"];
  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.log(
      "❌ Missing required environment variables:",
      missing.join(", ")
    );
    console.log("   Please check your .env file");
    return false;
  }

  console.log("✅ Environment configuration looks good");
  return true;
};

const main = async () => {
  console.log("🚀 Blog API Database Setup & Test\n");

  // Check environment
  if (!checkEnvironment()) {
    process.exit(1);
  }

  // Test database connection
  const connected = await connectToDatabase();
  if (!connected) {
    process.exit(1);
  }

  // Test database operations
  const operationsWorking = await testDatabaseOperations();
  if (!operationsWorking) {
    process.exit(1);
  }

  console.log("\n🎯 Your database is ready! You can now:");
  console.log("   1. Run: yarn dev (to start development server)");
  console.log(
    "   2. Run: node dist/utils/seedDatabase.js (to add sample data)"
  );
  console.log("   3. Test API endpoints at http://localhost:3000/api");

  await mongoose.connection.close();
  console.log("\n👋 Connection closed successfully");
};

// Handle script execution
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  });
}

module.exports = {
  connectToDatabase,
  testDatabaseOperations,
  checkEnvironment,
};
