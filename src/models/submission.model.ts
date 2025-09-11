import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    domain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Domain",
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
    },
    type: {
      type: String,
      enum: ["ONBOARDING", "QUIZ"],
      required: true,
    },
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        answer: mongoose.Schema.Types.Mixed,
        score: Number,
        feedback: String,
      },
    ],
    totalScore: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
    feedback: String,
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

// Indexes for efficient querying
submissionSchema.index({ user: 1, domain: 1 });
submissionSchema.index({ domain: 1, status: 1 });
submissionSchema.index({ quiz: 1 });
submissionSchema.index({ reviewedBy: 1 });

export const Submission =
  mongoose.models.Submission || mongoose.model("Submission", submissionSchema);
