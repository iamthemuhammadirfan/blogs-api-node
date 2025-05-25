const { connectDatabase, disconnectDatabase } = require("../config/database");
const { User, Blog } = require("../models");

// Sample users data
const sampleUsers = [
  {
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    bio: "Software engineer and writer passionate about technology and innovation.",
    profile_pic_url:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
  },
  {
    first_name: "Jane",
    last_name: "Smith",
    email: "jane.smith@example.com",
    bio: "Full-stack developer and tech blogger sharing insights about modern web development.",
    profile_pic_url:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400",
  },
  {
    first_name: "Alex",
    last_name: "Johnson",
    email: "alex.johnson@example.com",
    bio: "DevOps engineer and cloud computing enthusiast.",
    profile_pic_url:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
  },
];

// Sample blogs data (will be populated with actual user IDs after users are created)
const sampleBlogsTemplate = [
  {
    title: "Getting Started with TypeScript",
    sub_title: "A comprehensive guide to TypeScript for beginners",
    content: `TypeScript is a powerful superset of JavaScript that adds static type definitions. In this comprehensive guide, we'll explore the fundamentals of TypeScript and how it can improve your development workflow.

## Why TypeScript?

TypeScript offers several advantages over plain JavaScript:
- **Type Safety**: Catch errors at compile time rather than runtime
- **Better IDE Support**: Enhanced autocomplete, refactoring, and navigation
- **Improved Code Quality**: Self-documenting code with type annotations
- **Gradual Adoption**: Can be introduced incrementally into existing JavaScript projects

## Getting Started

To start using TypeScript, you'll need to install it:

\`\`\`bash
npm install -g typescript
\`\`\`

Then you can compile TypeScript files:

\`\`\`bash
tsc your-file.ts
\`\`\`

## Basic Types

TypeScript provides several basic types:

\`\`\`typescript
let name: string = "John";
let age: number = 30;
let isActive: boolean = true;
\`\`\`

This is just the beginning of what TypeScript can offer. As you continue learning, you'll discover more advanced features like interfaces, generics, and decorators.`,
    tags: ["typescript", "javascript", "programming", "tutorial"],
  },
  {
    title: "Building REST APIs with Node.js and Express",
    sub_title: "Learn how to create scalable backend applications",
    content: `Building robust REST APIs is a crucial skill for backend developers. In this article, we'll explore how to create a scalable API using Node.js and Express.js.

## Setting Up the Project

First, let's initialize a new Node.js project:

\`\`\`bash
npm init -y
npm install express mongoose cors helmet
npm install -D @types/node @types/express typescript
\`\`\`

## Creating the Express App

Here's a basic Express server setup:

\`\`\`javascript
const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
\`\`\`

## Best Practices

When building REST APIs, consider these best practices:
- Use proper HTTP status codes
- Implement input validation
- Add rate limiting
- Use middleware for common functionality
- Implement proper error handling

Following these practices will help you create maintainable and scalable APIs.`,
    tags: ["nodejs", "express", "api", "backend", "javascript"],
  },
  {
    title: "MongoDB and Mongoose: Database Modeling Best Practices",
    sub_title: "Design efficient schemas for your Node.js applications",
    content: `MongoDB is a popular NoSQL database, and Mongoose is the most widely used ODM (Object Document Mapper) for Node.js applications. In this guide, we'll explore best practices for database modeling.

## Understanding MongoDB Documents

MongoDB stores data in flexible, JSON-like documents. Unlike SQL databases, MongoDB doesn't require a predefined schema:

\`\`\`javascript
{
  "_id": ObjectId("..."),
  "name": "John Doe",
  "email": "john@example.com",
  "posts": [
    {
      "title": "My First Post",
      "content": "This is my first blog post...",
      "tags": ["intro", "personal"]
    }
  ]
}
\`\`\`

## Mongoose Schemas

Mongoose adds a layer of structure to MongoDB:

\`\`\`javascript
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  created_date: {
    type: Date,
    default: Date.now
  }
});
\`\`\`

## Modeling Relationships

There are two main approaches to modeling relationships in MongoDB:
1. **Embedding**: Store related data within the same document
2. **Referencing**: Store references to other documents

Choose embedding when data is frequently accessed together and doesn't change often. Use referencing when data is large or changes frequently.

Understanding these concepts will help you design efficient database schemas for your applications.`,
    tags: ["mongodb", "mongoose", "database", "nodejs", "schema"],
  },
  {
    title: "Deploying Node.js Applications to Production",
    sub_title: "A complete guide to production deployment strategies",
    content: `Deploying Node.js applications to production requires careful consideration of performance, security, and reliability. This guide covers essential deployment practices.

## Production Environment Setup

Before deploying, ensure your application is production-ready:

\`\`\`javascript
// Use environment variables
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DATABASE_URL;

// Enable compression
const compression = require('compression');
app.use(compression());

// Set security headers
app.use(helmet());
\`\`\`

## Process Management

Use a process manager like PM2 to keep your application running:

\`\`\`bash
npm install -g pm2
pm2 start app.js --name "my-app"
pm2 startup
pm2 save
\`\`\`

## Docker Deployment

Containerize your application with Docker:

\`\`\`dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## Monitoring and Logging

Implement proper logging and monitoring:
- Use structured logging (JSON format)
- Monitor application metrics
- Set up error tracking
- Implement health checks

## Security Considerations

- Keep dependencies updated
- Use HTTPS in production
- Implement rate limiting
- Validate all inputs
- Use secure session management

Following these practices ensures your Node.js application runs smoothly in production.`,
    tags: ["deployment", "production", "devops", "nodejs", "docker"],
  },
  {
    title: "Modern JavaScript ES6+ Features Every Developer Should Know",
    sub_title:
      "Explore the latest JavaScript features and how to use them effectively",
    content: `JavaScript has evolved significantly with ES6+ features. This article covers the most important modern JavaScript features that every developer should master.

## Arrow Functions

Arrow functions provide a concise way to write functions:

\`\`\`javascript
// Traditional function
function add(a, b) {
  return a + b;
}

// Arrow function
const add = (a, b) => a + b;

// With array methods
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
\`\`\`

## Destructuring

Extract values from arrays and objects easily:

\`\`\`javascript
// Array destructuring
const [first, second, ...rest] = [1, 2, 3, 4, 5];

// Object destructuring
const { name, age, email } = user;
const { name: userName, age: userAge } = user; // Renaming
\`\`\`

## Template Literals

Create strings with embedded expressions:

\`\`\`javascript
const name = 'John';
const age = 30;
const message = \`Hello, my name is \${name} and I'm \${age} years old.\`;
\`\`\`

## Async/Await

Handle asynchronous operations more elegantly:

\`\`\`javascript
// Instead of promises
function fetchUser() {
  return fetch('/api/user')
    .then(response => response.json())
    .then(user => user)
    .catch(error => console.error(error));
}

// Use async/await
async function fetchUser() {
  try {
    const response = await fetch('/api/user');
    const user = await response.json();
    return user;
  } catch (error) {
    console.error(error);
  }
}
\`\`\`

## Modules

Organize your code with ES6 modules:

\`\`\`javascript
// math.js
export const add = (a, b) => a + b;
export const multiply = (a, b) => a * b;
export default class Calculator {
  // ...
}

// main.js
import Calculator, { add, multiply } from './math.js';
\`\`\`

These features make JavaScript more powerful and expressive. Mastering them will significantly improve your development experience.`,
    tags: ["javascript", "es6", "modern-js", "programming", "frontend"],
  },
];

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Connect to database
    await connectDatabase();

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Blog.deleteMany({});
    await User.deleteMany({});

    // Create users
    console.log("👤 Creating sample users...");
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create blogs with user references
    console.log("📝 Creating sample blogs...");
    const blogsWithAuthors = sampleBlogsTemplate.map((blog, index) => ({
      ...blog,
      author: createdUsers[index % createdUsers.length]._id,
    }));

    const createdBlogs = await Blog.insertMany(blogsWithAuthors);
    console.log(`✅ Created ${createdBlogs.length} blogs`);

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   Users created: ${createdUsers.length}`);
    console.log(`   Blogs created: ${createdBlogs.length}`);

    // Display some sample data
    console.log("\n🔍 Sample Data:");
    console.log("\n👥 Users:");
    createdUsers.forEach((user, index) => {
      console.log(
        `   ${index + 1}. ${user.first_name} ${user.last_name} (${user.email})`
      );
    });

    console.log("\n📚 Blogs:");
    createdBlogs.forEach((blog, index) => {
      console.log(`   ${index + 1}. ${blog.title}`);
    });
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await disconnectDatabase();
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("\n✨ Seeding process completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Seeding process failed:", error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
