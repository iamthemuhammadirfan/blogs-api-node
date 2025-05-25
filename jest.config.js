module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js", "**/tests/**/*.spec.js"],
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/index.js",
    "!src/utils/seedDatabase.js",
    "!**/node_modules/**",
  ],
  coverageReporters: ["text", "lcov", "html"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testTimeout: 30000,
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
