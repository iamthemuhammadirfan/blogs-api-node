const { Blog } = require("../models");
const {
  formatBlogResponse,
  createPaginatedResponse,
  sendSuccessResponse,
  validatePaginationParams,
  parseTags,
} = require("../utils/responseHelpers");
const { asyncHandler, AppError } = require("../middleware");

class BlogController {
  // GET /api/blogs?page={page}&limit={limit}&tags={tags}
  static getBlogs = asyncHandler(async (req, res) => {
    const { page: pageQuery, limit: limitQuery, tags: tagsQuery } = req.query;

    // Validate and parse pagination parameters
    const { page, limit, skip } = validatePaginationParams(
      pageQuery,
      limitQuery
    );

    // Parse tags if provided
    const tags = parseTags(tagsQuery);

    // Build query
    const query = {};
    if (tags.length > 0) {
      query.tags = { $in: tags };
    }

    try {
      // Get total count for pagination
      const total = await Blog.countDocuments(query);

      // Get blogs with pagination and populate author
      const blogs = await Blog.find(query)
        .populate("author", "first_name last_name bio profile_pic_url")
        .sort({ created_date: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Format response
      const formattedBlogs = blogs.map((blog) => formatBlogResponse(blog));
      const paginatedResponse = createPaginatedResponse(
        formattedBlogs,
        page,
        limit,
        total
      );

      return sendSuccessResponse(
        res,
        paginatedResponse,
        "Blogs retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching blogs:", error);
      throw new AppError("Failed to fetch blogs", 500, "FETCH_ERROR");
    }
  });

  // GET /api/blogs/:id
  static getBlogById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      const blog = await Blog.findById(id)
        .populate("author", "first_name last_name bio profile_pic_url")
        .lean();

      if (!blog) {
        throw new AppError("Blog not found", 404, "BLOG_NOT_FOUND");
      }

      const formattedBlog = formatBlogResponse(blog);
      return sendSuccessResponse(
        res,
        formattedBlog,
        "Blog retrieved successfully"
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Error fetching blog by ID:", error);
      throw new AppError("Failed to fetch blog", 500, "FETCH_ERROR");
    }
  });

  // PUT /api/blogs/:id
  static updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Remove empty fields
    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(
        ([_, value]) => value !== undefined && value !== ""
      )
    );

    if (Object.keys(filteredUpdateData).length === 0) {
      throw new AppError(
        "No valid fields provided for update",
        400,
        "NO_UPDATE_DATA"
      );
    }

    try {
      const updatedBlog = await Blog.findByIdAndUpdate(id, filteredUpdateData, {
        new: true,
        runValidators: true,
      })
        .populate("author", "first_name last_name bio profile_pic_url")
        .lean();

      if (!updatedBlog) {
        throw new AppError("Blog not found", 404, "BLOG_NOT_FOUND");
      }

      const formattedBlog = formatBlogResponse(updatedBlog);
      return sendSuccessResponse(
        res,
        formattedBlog,
        "Blog updated successfully"
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Error updating blog:", error);
      throw new AppError("Failed to update blog", 500, "UPDATE_ERROR");
    }
  });

  // POST /api/blogs (Optional - for creating blogs)
  static createBlog = asyncHandler(async (req, res) => {
    const blogData = req.body;

    try {
      const newBlog = new Blog(blogData);
      const savedBlog = await newBlog.save();

      const populatedBlog = await Blog.findById(savedBlog._id)
        .populate("author", "first_name last_name bio profile_pic_url")
        .lean();

      const formattedBlog = formatBlogResponse(populatedBlog);
      return sendSuccessResponse(
        res,
        formattedBlog,
        "Blog created successfully",
        201
      );
    } catch (error) {
      console.error("Error creating blog:", error);
      throw new AppError("Failed to create blog", 500, "CREATE_ERROR");
    }
  });

  // GET /api/blogs/tags
  static getTags = asyncHandler(async (req, res) => {
    try {
      // Use MongoDB aggregation to get all unique tags
      const tagsResult = await Blog.aggregate([
        // Unwind the tags array to create a document for each tag
        { $unwind: "$tags" },
        // Group by tag and count occurrences
        {
          $group: {
            _id: "$tags",
            count: { $sum: 1 },
          },
        },
        // Sort by count in descending order
        { $sort: { count: -1 } },
        // Format the output
        {
          $project: {
            _id: 0,
            tag: "$_id",
            count: 1,
          },
        },
      ]);

      // Extract just the tag names for simpler response
      const tags = tagsResult.map((item) => item.tag);

      return sendSuccessResponse(
        res,
        {
          tags,
          total: tags.length,
          tagDetails: tagsResult, // Include count details for additional information
        },
        "Tags retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching tags:", error);
      throw new AppError("Failed to fetch tags", 500, "FETCH_TAGS_ERROR");
    }
  });

  // DELETE /api/blogs/:id (Optional - for deleting blogs)
  static deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      const deletedBlog = await Blog.findByIdAndDelete(id);

      if (!deletedBlog) {
        throw new AppError("Blog not found", 404, "BLOG_NOT_FOUND");
      }

      return sendSuccessResponse(res, null, "Blog deleted successfully");
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Error deleting blog:", error);
      throw new AppError("Failed to delete blog", 500, "DELETE_ERROR");
    }
  });
}

module.exports = { BlogController };
