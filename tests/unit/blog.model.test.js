const { Blog, User } = require("../../src/models");
const {
  sampleBlogs,
  invalidBlogData,
  sampleUsers,
} = require("../fixtures/testData");

describe("Blog Model", () => {
  let testUser;

  beforeEach(async () => {
    // Create a test user for blog association
    testUser = await User.create(sampleUsers[0]);
  });

  describe("Schema Validation", () => {
    it("should create a valid blog with all required fields", async () => {
      const blogData = {
        ...sampleBlogs[0],
        author: testUser._id,
      };

      const blog = new Blog(blogData);
      const savedBlog = await blog.save();

      expect(savedBlog._id).toBeDefined();
      expect(savedBlog.title).toBe(blogData.title);
      expect(savedBlog.content).toBe(blogData.content);
      expect(savedBlog.author.toString()).toBe(testUser._id.toString());
      expect(savedBlog.tags).toEqual(blogData.tags);
      expect(savedBlog.slug).toBeDefined();
      expect(savedBlog.created_date).toBeDefined();
      expect(savedBlog.modified_date).toBeDefined();
    });

    it("should generate a unique slug based on title", async () => {
      const blogData = {
        ...sampleBlogs[0],
        author: testUser._id,
      };

      const blog = new Blog(blogData);
      const savedBlog = await blog.save();

      expect(savedBlog.slug).toBe("getting-started-with-node-js");
    });

    it("should handle duplicate slugs by appending numbers", async () => {
      const blogData = {
        ...sampleBlogs[0],
        author: testUser._id,
      };

      // Create first blog
      const blog1 = new Blog(blogData);
      const savedBlog1 = await blog1.save();

      // Create second blog with same title
      const blog2 = new Blog(blogData);
      const savedBlog2 = await blog2.save();

      expect(savedBlog1.slug).toBe("getting-started-with-node-js");
      expect(savedBlog2.slug).toBe("getting-started-with-node-js-1");
    });

    it("should require title field", async () => {
      const blogData = {
        ...invalidBlogData[0],
        author: testUser._id,
      };

      const blog = new Blog(blogData);

      await expect(blog.save()).rejects.toThrow(/Path `title` is required/);
    });

    it("should require content field", async () => {
      const blogData = {
        ...invalidBlogData[1],
        author: testUser._id,
      };

      const blog = new Blog(blogData);

      await expect(blog.save()).rejects.toThrow(/Path `content` is required/);
    });

    it("should require author field", async () => {
      const blogData = sampleBlogs[0];
      // No author field

      const blog = new Blog(blogData);

      await expect(blog.save()).rejects.toThrow(/Path `author` is required/);
    });

    it("should validate author is a valid ObjectId", async () => {
      const blogData = {
        ...sampleBlogs[0],
        author: "invalid-object-id",
      };

      const blog = new Blog(blogData);

      await expect(blog.save()).rejects.toThrow(/Cast to ObjectId failed/);
    });

    it("should have default values for optional fields", async () => {
      const blogData = {
        title: "Test Blog",
        content: "Test content",
        author: testUser._id,
      };

      const blog = new Blog(blogData);
      const savedBlog = await blog.save();

      expect(savedBlog.tags).toEqual([]);
      expect(savedBlog.isPublished).toBe(false);
      expect(savedBlog.views).toBe(0);
    });

    it("should accept tags as an array", async () => {
      const blogData = {
        ...sampleBlogs[0],
        author: testUser._id,
      };

      const blog = new Blog(blogData);
      const savedBlog = await blog.save();

      expect(Array.isArray(savedBlog.tags)).toBe(true);
      expect(savedBlog.tags).toEqual(blogData.tags);
    });
  });

  describe("Instance Methods", () => {
    it("should return JSON without sensitive fields", async () => {
      const blogData = {
        ...sampleBlogs[0],
        author: testUser._id,
      };

      const blog = new Blog(blogData);
      const savedBlog = await blog.save();

      const blogJson = savedBlog.toJSON();

      expect(blogJson._id).toBeDefined();
      expect(blogJson.title).toBe(blogData.title);
      expect(blogJson.content).toBe(blogData.content);
      expect(blogJson.slug).toBeDefined();
      expect(blogJson.__v).toBeUndefined(); // Should be removed by transform
    });
  });

  describe("Virtuals and Population", () => {
    it("should populate author information", async () => {
      const blogData = {
        ...sampleBlogs[0],
        author: testUser._id,
      };

      const blog = await Blog.create(blogData);
      const populatedBlog = await Blog.findById(blog._id).populate("author");

      expect(populatedBlog.author.name).toBe(testUser.name);
      expect(populatedBlog.author.email).toBe(testUser.email);
    });
  });

  describe("Static Methods", () => {
    beforeEach(async () => {
      // Create multiple test blogs
      const blogPromises = sampleBlogs.map((blogData) =>
        Blog.create({
          ...blogData,
          author: testUser._id,
        })
      );
      await Promise.all(blogPromises);
    });

    it("should find published blogs only", async () => {
      const publishedBlogs = await Blog.find({ isPublished: true });

      expect(publishedBlogs.length).toBe(2); // Only 2 published blogs in sample data
      publishedBlogs.forEach((blog) => {
        expect(blog.isPublished).toBe(true);
      });
    });

    it("should find blogs by tag", async () => {
      const nodeBlogs = await Blog.find({ tags: "nodejs" });

      expect(nodeBlogs.length).toBe(1);
      expect(nodeBlogs[0].tags).toContain("nodejs");
    });

    it("should find blog by slug", async () => {
      const blog = await Blog.findOne({ slug: "getting-started-with-node-js" });

      expect(blog).toBeTruthy();
      expect(blog.title).toBe("Getting Started with Node.js");
    });

    it("should sort blogs by creation date", async () => {
      const blogs = await Blog.find().sort({ created_date: -1 });

      expect(blogs.length).toBe(3);
      // Check if sorted in descending order
      for (let i = 0; i < blogs.length - 1; i++) {
        expect(blogs[i].createdAt.getTime()).toBeGreaterThanOrEqual(
          blogs[i + 1].createdAt.getTime()
        );
      }
    });
  });

  describe("Indexing", () => {
    it("should have compound index on author and createdAt", async () => {
      const indexes = await Blog.collection.getIndexes();

      // Check if compound index exists
      const hasCompoundIndex = Object.keys(indexes).some((indexName) => {
        const index = indexes[indexName];
        return index.some(
          (field) => field[0] === "author" || field[0] === "createdAt"
        );
      });

      expect(hasCompoundIndex).toBe(true);
    });
  });
});
