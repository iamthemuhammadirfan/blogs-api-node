#!/usr/bin/env node

/**
 * API Test Script
 * This script demonstrates how to use the Blog API endpoints
 */

const axios = require("axios");

const API_BASE = "http://localhost:3000/api";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const testAPI = async () => {
  console.log("🧪 Testing Blog API endpoints...\n");

  try {
    // Test 1: Create a user
    console.log("1️⃣ Creating a test user...");
    const userResponse = await axios.post(`${API_BASE}/users`, {
      first_name: "Jane",
      last_name: "Doe",
      email: "jane.doe@example.com",
      bio: "Full-stack developer passionate about TypeScript and Node.js",
    });

    const userId = userResponse.data.data._id;
    console.log(
      "   ✅ User created successfully:",
      userResponse.data.data.email
    );

    await sleep(500);

    // Test 2: Create a blog post
    console.log("\n2️⃣ Creating a test blog post...");
    const blogResponse = await axios.post(`${API_BASE}/blogs`, {
      title: "Getting Started with TypeScript",
      sub_title: "A comprehensive guide for beginners",
      content:
        "TypeScript is a powerful superset of JavaScript that adds static typing...",
      tags: ["typescript", "javascript", "programming"],
      author: userId,
    });

    const blogId = blogResponse.data.data._id;
    console.log(
      "   ✅ Blog post created successfully:",
      blogResponse.data.data.title
    );

    await sleep(500);

    // Test 3: Get all blogs
    console.log("\n3️⃣ Fetching all blog posts...");
    const allBlogsResponse = await axios.get(`${API_BASE}/blogs`);
    console.log(
      "   ✅ Retrieved blogs:",
      allBlogsResponse.data.data.length,
      "posts found"
    );

    await sleep(500);

    // Test 4: Get blog by slug
    console.log("\n4️⃣ Fetching blog by slug...");
    const slug = blogResponse.data.data.slug;
    const blogBySlugResponse = await axios.get(`${API_BASE}/blogs/${slug}`);
    console.log(
      "   ✅ Retrieved blog by slug:",
      blogBySlugResponse.data.data.title
    );

    await sleep(500);

    // Test 5: Update blog post
    console.log("\n5️⃣ Updating blog post...");
    const updateResponse = await axios.put(`${API_BASE}/blogs/${blogId}`, {
      title: "Getting Started with TypeScript - Updated",
      tags: ["typescript", "javascript", "programming", "tutorial"],
    });
    console.log("   ✅ Blog post updated successfully");

    await sleep(500);

    // Test 6: Get blogs with pagination and filtering
    console.log("\n6️⃣ Testing pagination and filtering...");
    const filteredResponse = await axios.get(
      `${API_BASE}/blogs?page=1&limit=5&tags=typescript`
    );
    console.log(
      "   ✅ Filtered blogs retrieved:",
      filteredResponse.data.data.length,
      'posts with "typescript" tag'
    );

    await sleep(500);

    // Test 7: Get user by ID
    console.log("\n7️⃣ Fetching user by ID...");
    const userByIdResponse = await axios.get(`${API_BASE}/users/${userId}`);
    console.log("   ✅ User retrieved:", userByIdResponse.data.data.email);

    console.log("\n🎉 All API tests passed successfully!");
    console.log("\n📊 Test Summary:");
    console.log("   ✅ User creation and retrieval");
    console.log("   ✅ Blog post creation and updates");
    console.log("   ✅ Blog retrieval by slug");
    console.log("   ✅ Pagination and filtering");
    console.log("   ✅ All endpoints working correctly");
  } catch (error) {
    console.error("\n❌ API test failed:");

    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error("   Error:", error.response.data);
    } else if (error.request) {
      console.error("   Connection error - is the server running?");
      console.error("   Make sure to start the server with: yarn dev");
    } else {
      console.error("   Error:", error.message);
    }

    process.exit(1);
  }
};

// Check if server is running
const checkServer = async () => {
  try {
    await axios.get(`${API_BASE}/blogs`);
    return true;
  } catch (error) {
    return false;
  }
};

const main = async () => {
  console.log("🚀 Blog API Test Suite\n");

  console.log("🔍 Checking if server is running...");
  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.log("❌ Server is not running on http://localhost:3000");
    console.log("   Please start the server first:");
    console.log("   1. yarn dev (for development)");
    console.log("   2. yarn start (for production)");
    console.log("   3. Make sure MongoDB is connected");
    process.exit(1);
  }

  console.log("✅ Server is running!\n");
  await testAPI();
};

if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Test suite failed:", error.message);
    process.exit(1);
  });
}
