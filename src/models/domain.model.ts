import mongoose from "mongoose";
import { OnboardingFieldType } from "@/types/enums";

const domainSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    moderators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    onboardingFields: [
      {
        label: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: Object.values(OnboardingFieldType),
          required: true,
        },
        required: {
          type: Boolean,
          default: false,
        },
        options: [
          {
            type: String,
          },
        ],
        description: String,
        validation: {
          min: Number,
          max: Number,
          pattern: String,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

// Indexes for efficient queries
domainSchema.index({ slug: 1 });
domainSchema.index({ moderators: 1 });
domainSchema.index({ createdBy: 1 });

export const Domain =
  mongoose.models.Domain || mongoose.model("Domain", domainSchema);
