const formatBlogResponse = (blog) => {
  // Handle null or undefined blog
  if (blog === null) {
    return null;
  }
  if (blog === undefined) {
    return undefined;
  }

  // Handle case where author is not populated (just an ObjectId string)
  if (typeof blog.author === "string") {
    return {
      _id: blog._id.toString(),
      title: blog.title,
      content: blog.content,
      slug: blog.slug,
      tags: blog.tags || [],
      author: blog.author,
      createdAt: blog.created_date,
      updatedAt: blog.modified_date,
      ...(blog.sub_title && { sub_title: blog.sub_title }),
      // Legacy fields for backward compatibility
      isPublished: blog.isPublished !== undefined ? blog.isPublished : true,
      views: blog.views || 0,
    };
  }

  // Handle case where author is not present or not properly populated
  if (!blog.author || !("first_name" in blog.author)) {
    return {
      _id: blog._id.toString(),
      title: blog.title,
      content: blog.content,
      slug: blog.slug,
      tags: blog.tags || [],
      author: blog.author,
      createdAt: blog.created_date,
      updatedAt: blog.modified_date,
      ...(blog.sub_title && { sub_title: blog.sub_title }),
      // Legacy fields for backward compatibility
      isPublished: blog.isPublished !== undefined ? blog.isPublished : true,
      views: blog.views || 0,
    };
  }

  // Author is properly populated
  const authorInfo = blog.author;
  const authorName = `${authorInfo.first_name || ""} ${
    authorInfo.last_name || ""
  }`.trim();

  return {
    _id: blog._id.toString(),
    title: blog.title,
    content: blog.content,
    slug: blog.slug,
    tags: blog.tags || [],
    createdAt: blog.created_date,
    updatedAt: blog.modified_date,
    ...(blog.sub_title && { sub_title: blog.sub_title }),
    // Legacy fields for backward compatibility
    isPublished: blog.isPublished !== undefined ? blog.isPublished : true,
    views: blog.views || 0,
    author: {
      _id: authorInfo._id.toString(),
      name: authorName,
      slug: authorInfo.slug || authorName.toLowerCase().replace(/\s+/g, "-"),
      first_name: authorInfo.first_name,
      last_name: authorInfo.last_name,
      ...(authorInfo.bio && { bio: authorInfo.bio }),
      ...(authorInfo.profile_pic_url && {
        profile_pic_url: authorInfo.profile_pic_url,
      }),
    },
  };
};

const formatUserResponse = (user) => {
  // Handle null or undefined user
  if (user === null) {
    return null;
  }
  if (user === undefined) {
    return undefined;
  }

  // Format full name for backward compatibility
  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
  const slug = user.slug || fullName.toLowerCase().replace(/\s+/g, "-");

  return {
    _id: user._id.toString(),
    name: fullName,
    email: user.email,
    slug: slug,
    createdAt: user.created_date,
    updatedAt: user.modified_date,
    // Include actual field names for completeness
    first_name: user.first_name,
    last_name: user.last_name,
    created_date: user.created_date,
    modified_date: user.modified_date,
    ...(user.bio && { bio: user.bio }),
    ...(user.profile_pic_url && { profile_pic_url: user.profile_pic_url }),
  };
};

const createPaginatedResponse = (data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      current_page: page,
      total_pages: totalPages,
      total_items: total,
      items_per_page: limit,
      has_next: page < totalPages,
      has_prev: page > 1,
    },
  };
};

const sendSuccessResponse = (res, data, message, statusCode = 200) => {
  const response = {
    success: true,
    data,
    ...(message && { message }),
  };
  return res.status(statusCode).json(response);
};

const sendErrorResponse = (res, message, code, statusCode = 400, details) => {
  const response = {
    error: {
      message,
      code,
      details,
    },
  };
  return res.status(statusCode).json(response);
};

const sendPaginatedResponse = (
  res,
  data,
  page,
  limit,
  total,
  message,
  statusCode = 200
) => {
  const paginatedData = createPaginatedResponse(data, page, limit, total);
  const response = {
    success: true,
    ...paginatedData,
    ...(message && { message }),
  };
  return res.status(statusCode).json(response);
};

const validatePaginationParams = (page, limit) => {
  const pageNum = parseInt(page || "1", 10);
  const limitNum = parseInt(limit || "10", 10);

  const validatedPage = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
  const validatedLimit =
    isNaN(limitNum) || limitNum < 1 || limitNum > 100 ? 10 : limitNum;

  return {
    page: validatedPage,
    limit: validatedLimit,
    skip: (validatedPage - 1) * validatedLimit,
  };
};

const parseTags = (tagsQuery) => {
  if (!tagsQuery) return [];

  return tagsQuery
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0);
};

module.exports = {
  formatBlogResponse,
  formatUserResponse,
  createPaginatedResponse,
  sendSuccessResponse,
  sendErrorResponse,
  sendPaginatedResponse,
  validatePaginationParams,
  parseTags,
};
