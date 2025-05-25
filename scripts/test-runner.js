#!/usr/bin/env node

/**
 * Comprehensive Test Runner Script
 * Runs all tests with proper setup and teardown
 */

const { execSync } = require("child_process");
const path = require("path");

// Colors for console output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${colors.blue}${colors.bold}${description}${colors.reset}`);
  log(`${colors.yellow}Running: ${command}${colors.reset}`);

  try {
    const output = execSync(command, {
      cwd: process.cwd(),
      stdio: "inherit",
      env: { ...process.env, NODE_ENV: "test" },
    });
    log(
      `${colors.green}✓ ${description} completed successfully${colors.reset}`
    );
    return true;
  } catch (error) {
    log(`${colors.red}✗ ${description} failed${colors.reset}`);
    console.error(error.message);
    return false;
  }
}

async function runTests() {
  log(
    `${colors.bold}${colors.blue}🧪 Blog API - Comprehensive Test Suite${colors.reset}`
  );
  log(
    `${colors.yellow}========================================${colors.reset}`
  );

  const testCommands = [
    {
      command: "yarn lint",
      description: "1. Running ESLint (Code Quality)",
    },
    {
      command: "yarn test:unit",
      description: "2. Running Unit Tests",
    },
    {
      command: "yarn test:integration",
      description: "3. Running Integration Tests",
    },
    {
      command: "yarn test:coverage",
      description: "4. Running Coverage Report",
    },
  ];

  let allPassed = true;

  for (const { command, description } of testCommands) {
    const success = runCommand(command, description);
    if (!success) {
      allPassed = false;
      // Continue with other tests even if one fails
    }
  }

  log(`\n${colors.bold}${colors.blue}📊 Test Summary${colors.reset}`);
  log(`${colors.yellow}===============${colors.reset}`);

  if (allPassed) {
    log(
      `${colors.green}${colors.bold}✅ All tests passed successfully!${colors.reset}`
    );
    log(
      `${colors.green}🎉 Your Blog API is ready for interview presentation!${colors.reset}`
    );
  } else {
    log(`${colors.red}${colors.bold}❌ Some tests failed${colors.reset}`);
    log(
      `${colors.red}🔧 Please fix the failing tests before interview presentation${colors.reset}`
    );
    process.exit(1);
  }

  log(`\n${colors.blue}${colors.bold}📋 Available Commands:${colors.reset}`);
  log(`${colors.yellow}yarn test          ${colors.reset} - Run all tests`);
  log(
    `${colors.yellow}yarn test:unit     ${colors.reset} - Run unit tests only`
  );
  log(
    `${colors.yellow}yarn test:integration ${colors.reset} - Run integration tests only`
  );
  log(
    `${colors.yellow}yarn test:watch    ${colors.reset} - Run tests in watch mode`
  );
  log(
    `${colors.yellow}yarn test:coverage ${colors.reset} - Run tests with coverage report`
  );
  log(
    `${colors.yellow}yarn start         ${colors.reset} - Start production server`
  );
  log(
    `${colors.yellow}yarn dev           ${colors.reset} - Start development server`
  );
}

// Handle script interruption
process.on("SIGINT", () => {
  log(`\n${colors.yellow}Test execution interrupted${colors.reset}`);
  process.exit(0);
});

process.on("SIGTERM", () => {
  log(`\n${colors.yellow}Test execution terminated${colors.reset}`);
  process.exit(0);
});

// Run the tests
runTests().catch((error) => {
  log(
    `${colors.red}${colors.bold}Fatal error during test execution:${colors.reset}`
  );
  console.error(error);
  process.exit(1);
});
