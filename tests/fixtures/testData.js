const sampleUsers = [
  {
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    bio: "A passionate writer and developer.",
    created_date: new Date("2023-01-01"),
    modified_date: new Date("2023-01-01"),
  },
  {
    first_name: "Jane",
    last_name: "Smith",
    email: "jane.smith@example.com",
    bio: "Tech enthusiast and blogger.",
    created_date: new Date("2023-01-02"),
    modified_date: new Date("2023-01-02"),
  },
  {
    first_name: "Mike",
    last_name: "Johnson",
    email: "mike.johnson@example.com",
    bio: "Full-stack developer with 5 years of experience.",
    created_date: new Date("2023-01-03"),
    modified_date: new Date("2023-01-03"),
  },
];

const sampleBlogs = [
  {
    title: "Getting Started with Node.js",
    content:
      "Node.js is a powerful runtime for building server-side applications...",
    tags: ["nodejs", "javascript", "backend"],
    isPublished: true,
    created_date: new Date("2023-01-01"),
    modified_date: new Date("2023-01-01"),
  },
  {
    title: "Understanding MongoDB",
    content: "MongoDB is a NoSQL database that provides high performance...",
    tags: ["mongodb", "database", "nosql"],
    isPublished: true,
    created_date: new Date("2023-01-02"),
    modified_date: new Date("2023-01-02"),
  },
  {
    title: "Draft Blog Post",
    content: "This is a draft blog post that is not yet published...",
    tags: ["draft", "writing"],
    isPublished: false,
    created_date: new Date("2023-01-03"),
    modified_date: new Date("2023-01-03"),
  },
];

const invalidUserData = [
  {
    // Missing first_name
    last_name: "Doe",
    email: "invalid@example.com",
    bio: "Missing first name",
  },
  {
    first_name: "Valid",
    last_name: "Name",
    // Invalid email
    email: "invalid-email",
    bio: "Invalid email format",
  },
  {
    first_name: "",
    last_name: "User",
    email: "empty@example.com",
    bio: "Empty first name",
  },
];

const invalidBlogData = [
  {
    // Missing title
    content: "Content without title",
    tags: ["test"],
  },
  {
    title: "Valid Title",
    // Missing content
    tags: ["test"],
  },
  {
    title: "",
    content: "Empty title",
    tags: ["test"],
  },
];

module.exports = {
  sampleUsers,
  sampleBlogs,
  invalidUserData,
  invalidBlogData,
};
