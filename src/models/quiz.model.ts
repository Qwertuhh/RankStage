import mongoose from "mongoose";
import { QuizType } from "@/types/enums";

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    domain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Domain",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(QuizType),
      required: true,
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: Object.values(QuizType),
          required: true,
        },
        options: [
          {
            text: String,
            isCorrect: Boolean,
          },
        ],
        answer: String, // For non-MCQ questions
        points: {
          type: Number,
          required: true,
          min: 0,
        },
        explanation: String,
      },
    ],
    timeLimit: {
      type: Number, // in minutes
      min: 0,
    },
    passingScore: {
      type: Number,
      required: true,
      min: 0,
    },
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

// Indexes
quizSchema.index({ domain: 1 });
quizSchema.index({ createdBy: 1 });
quizSchema.index({ "questions.type": 1 });

export const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
