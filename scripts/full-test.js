#!/usr/bin/env node

const { spawn } = require("child_process");
const axios = require("axios");
const path = require("path");

const API_BASE_URL = "http://localhost:3000";
let serverProcess = null;

// Wait for server to be ready
async function waitForServer(timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await axios.get(`${API_BASE_URL}/api/health`);
      return true;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return false;
}

// Start server
function startServer() {
  return new Promise((resolve, reject) => {
    console.log("🚀 Starting server...");
    serverProcess = spawn("node", ["src/index.js"], {
      cwd: path.join(__dirname, ".."),
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env },
    });

    let output = "";

    serverProcess.stdout.on("data", (data) => {
      output += data.toString();
      if (output.includes("Server is running successfully")) {
        console.log("✅ Server started successfully!");
        resolve();
      }
    });

    serverProcess.stderr.on("data", (data) => {
      console.error("Server stderr:", data.toString());
    });

    serverProcess.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Server exited with code ${code}`));
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (serverProcess && !serverProcess.killed) {
        reject(new Error("Server startup timeout"));
      }
    }, 30000);
  });
}

// Stop server
function stopServer() {
  if (serverProcess && !serverProcess.killed) {
    console.log("🛑 Stopping server...");
    serverProcess.kill("SIGTERM");
    serverProcess = null;
  }
}

// Test all API endpoints
async function runTests() {
  try {
    console.log("\n📋 Running API Tests...\n");

    // Test 1: Health Check
    console.log("1️⃣ Testing health check...");
    const healthResponse = await axios.get(`${API_BASE_URL}/api/health`);
    console.log("✅ Health check passed:", healthResponse.data);

    // Test 2: Create User
    console.log("\n2️⃣ Creating test user...");
    const userResponse = await axios.post(`${API_BASE_URL}/api/users`, {
      first_name: "Test",
      last_name: "User",
      email: "test@example.com",
      bio: "Test user for API testing",
    });
    console.log("✅ User created:", userResponse.data.data.email);
    const userId = userResponse.data.data._id;

    // Test 3: Get Users
    console.log("\n3️⃣ Getting all users...");
    const usersResponse = await axios.get(`${API_BASE_URL}/api/users`);
    console.log("✅ Users retrieved:", usersResponse.data.data.length, "users");

    // Test 4: Create Blog
    console.log("\n4️⃣ Creating test blog...");
    const blogResponse = await axios.post(`${API_BASE_URL}/api/blogs`, {
      title: "Test Blog Post",
      content: "This is a test blog post content for API testing.",
      sub_title: "A test subtitle",
      author: userId,
      tags: ["test", "api", "javascript"],
    });
    console.log("✅ Blog created:", blogResponse.data.data.title);
    const blogId = blogResponse.data.data._id;

    // Test 5: Get Blogs
    console.log("\n5️⃣ Getting all blogs...");
    const blogsResponse = await axios.get(`${API_BASE_URL}/api/blogs`);
    console.log("✅ Blogs retrieved:", blogsResponse.data.data.length, "blogs");

    // Test 6: Get Blog by ID
    console.log("\n6️⃣ Getting blog by ID...");
    const blogByIdResponse = await axios.get(
      `${API_BASE_URL}/api/blogs/${blogId}`
    );
    console.log("✅ Blog retrieved by ID:", blogByIdResponse.data.data.title);

    // Test 7: Update Blog
    console.log("\n7️⃣ Updating blog...");
    const updateResponse = await axios.put(
      `${API_BASE_URL}/api/blogs/${blogId}`,
      {
        title: "Updated Test Blog Post",
        content: "This is updated content.",
        tags: ["updated", "test"],
      }
    );
    console.log("✅ Blog updated:", updateResponse.data.data.title);

    // Test 8: Search Blogs
    console.log("\n8️⃣ Searching blogs...");
    const searchResponse = await axios.get(
      `${API_BASE_URL}/api/blogs/search?q=updated`
    );
    console.log(
      "✅ Search completed:",
      searchResponse.data.data.length,
      "results"
    );

    // Test 9: Delete Blog
    console.log("\n9️⃣ Deleting blog...");
    await axios.delete(`${API_BASE_URL}/api/blogs/${blogId}`);
    console.log("✅ Blog deleted successfully");

    // Test 10: Delete User
    console.log("\n🔟 Deleting user...");
    await axios.delete(`${API_BASE_URL}/api/users/${userId}`);
    console.log("✅ User deleted successfully");

    console.log("\n🎉 All tests passed! The API is working correctly.");
    return true;
  } catch (error) {
    console.error("\n❌ Test failed:", error.response?.data || error.message);
    return false;
  }
}

// Main execution
async function main() {
  try {
    // Start server
    await startServer();

    // Wait for server to be ready
    console.log("⏳ Waiting for server to be ready...");
    const isReady = await waitForServer();

    if (!isReady) {
      throw new Error("Server failed to start within timeout");
    }

    // Run tests
    const testsPassed = await runTests();

    // Stop server
    stopServer();

    if (testsPassed) {
      console.log("\n✨ All tests completed successfully!");
      process.exit(0);
    } else {
      console.log("\n❌ Some tests failed!");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error during testing:", error.message);
    stopServer();
    process.exit(1);
  }
}

// Handle cleanup on exit
process.on("SIGINT", () => {
  console.log("\n🛑 Received SIGINT, cleaning up...");
  stopServer();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Received SIGTERM, cleaning up...");
  stopServer();
  process.exit(0);
});

if (require.main === module) {
  main();
}
