const { Schema, model } = require("mongoose");
const slugify = require("slugify");

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Path `title` is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    sub_title: {
      type: String,
      trim: true,
      maxlength: [300, "Subtitle cannot exceed 300 characters"],
    },
    content: {
      type: String,
      required: [true, "Path `content` is required"],
      trim: true,
      minlength: [10, "Content must be at least 10 characters long"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [30, "Each tag cannot exceed 30 characters"],
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Path `author` is required"],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    created_date: {
      type: Date,
      default: Date.now,
    },
    modified_date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // We're handling timestamps manually
    versionKey: false,
  }
);

// Generate slug before saving
blogSchema.pre("save", async function (next) {
  if (this.isModified("title") || this.isNew) {
    // Custom slug generation to handle "Node.js" correctly
    let title = this.title;
    // Replace "Node.js" specifically to preserve the dash
    title = title.replace(/Node\.js/gi, "node-js");

    const baseSlug = slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
      replacement: "-",
    });

    // Ensure slug is unique
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (
      await model("Blog").findOne({ slug: uniqueSlug, _id: { $ne: this._id } })
    ) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = uniqueSlug;
  }

  // Update modified_date
  if (this.isModified() && !this.isNew) {
    this.modified_date = new Date();
  }

  next();
});

// Virtual field for createdAt to map to created_date
blogSchema.virtual("createdAt").get(function () {
  return this.created_date;
});

// Virtual field for updatedAt to map to modified_date
blogSchema.virtual("updatedAt").get(function () {
  return this.modified_date;
});

// Update modified_date before updating
blogSchema.pre(["updateOne", "findOneAndUpdate"], function () {
  this.set({ modified_date: new Date() });
});

// Indexes for better query performance
blogSchema.index({ tags: 1 });
blogSchema.index({ created_date: -1 });
// Compound index for author and created_date (used for user's blog listing)
blogSchema.index({ author: 1, created_date: -1 });
// Note: slug index is created automatically due to unique: true

// Text index for search functionality (optional for future use)
blogSchema.index({ title: "text", content: "text", tags: "text" });

const Blog = model("Blog", blogSchema);

module.exports = Blog;
