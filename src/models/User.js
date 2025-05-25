const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    first_name: {
      type: String,
      required: [true, "Path `first_name` is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    last_name: {
      type: String,
      required: [true, "Path `last_name` is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Path `email` is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    profile_pic_url: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Optional field
          return /^https?:\/\/.+/.test(v);
        },
        message: "Profile picture URL must be a valid URL",
      },
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

// Update modified_date before saving
userSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.modified_date = new Date();
  }
  next();
});

// Update modified_date before updating
userSchema.pre(["updateOne", "findOneAndUpdate"], function () {
  this.set({ modified_date: new Date() });
});

// Index for better query performance (email already indexed due to unique: true)
userSchema.index({ created_date: -1 });

const User = model("User", userSchema);

module.exports = User;
