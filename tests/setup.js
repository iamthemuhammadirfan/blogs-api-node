const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongod;

// Setup before all tests
beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // Connect to the in-memory database
  await mongoose.connect(uri);
});

// Cleanup after all tests
afterAll(async () => {
  // Close database connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();

  // Stop the in-memory MongoDB instance
  await mongod.stop();
});

// Clear all test data after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Global test utilities
global.testUtils = {
  // Helper to create test data
  createTestUser: () => ({
    name: "Test User",
    email: "test@example.com",
    bio: "Test bio",
  }),

  createTestBlog: (authorId) => ({
    title: "Test Blog Post",
    content: "This is test content for the blog post.",
    author: authorId,
    tags: ["test", "javascript"],
    isPublished: true,
  }),

  // Helper to generate random string
  randomString: (length = 10) => {
    return Math.random()
      .toString(36)
      .substring(2, length + 2);
  },
};
