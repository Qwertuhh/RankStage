import mongoose from "mongoose";
import { UserRole } from "@/types/enums";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    avatar: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      maxlength: 500,
      trim: true,
      default: "",
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for password reset
userSchema.index({ resetPasswordToken: 1 });

// Check if model exists before creating it to prevent model overwrite warning in development
export const User = mongoose.models.User || mongoose.model("User", userSchema);
