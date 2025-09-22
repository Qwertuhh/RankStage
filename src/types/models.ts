import { Document, Types } from 'mongoose';
import { UserRole, QuizType, OnboardingFieldType } from './enums';

// Base document type that all models will extend
export interface BaseDocument extends Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

// User Types
export interface IUser extends BaseDocument {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  role: UserRole;
  avatar?: Types.ObjectId;
  bio: string;
  location: string;
  isActive: boolean;
}

// Domain Types
export interface OnboardingField {
  name: string;
  label: string;
  type: OnboardingFieldType;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface IDomain extends BaseDocument {
  name: string;
  description: string;
  slug: string;
  moderators: Types.ObjectId[] | IUser[];
  onboardingFields: OnboardingField[];
  isActive: boolean;
  settings: {
    requireApproval: boolean;
    allowUserSubmissions: boolean;
    maxSubmissionsPerUser: number;
  };
  metadata: Record<string, unknown>;
}

// Quiz Types
export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
  explanation?: string;
  points: number;
  timeLimit?: number;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
}

export interface IQuiz extends BaseDocument {
  title: string;
  description: string;
  domain: Types.ObjectId | IDomain;
  type: QuizType;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
  isActive: boolean;
  tags: string[];
  createdBy: Types.ObjectId | IUser;
  updatedBy: Types.ObjectId | IUser;
  metadata: Record<string, unknown>;
}

// Submission Types
export interface UserAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timeTaken: number;
}

export interface ISubmission extends BaseDocument {
  quiz: Types.ObjectId | IQuiz;
  user: Types.ObjectId | IUser;
  domain: Types.ObjectId | IDomain;
  answers: UserAnswer[];
  score: number;
  isPassed: boolean;
  timeSpent: number;
  completedAt: Date;
  metadata: Record<string, unknown>;
}

// Model Types for Mongoose
export type UserDocument = IUser & Document;
export type DomainDocument = IDomain & Document;
export type QuizDocument = IQuiz & Document;
export type SubmissionDocument = ISubmission & Document;

// GridFS file type for avatar
interface GridFSFile {
  _id: Types.ObjectId;
  filename: string;
  contentType: string;
  length: number;
  uploadDate: Date;
  metadata?: Record<string, unknown>;
}

// Model Types with Populated Fields
export type PopulatedUserDocument = Omit<UserDocument, 'avatar'> & {
  avatar?: GridFSFile;
};

export type PopulatedDomainDocument = Omit<DomainDocument, 'moderators'> & {
  moderators: IUser[];
};

export type PopulatedQuizDocument = Omit<QuizDocument, 'domain' | 'createdBy' | 'updatedBy'> & {
  domain: IDomain;
  createdBy: IUser;
  updatedBy: IUser;
};

export type PopulatedSubmissionDocument = Omit<SubmissionDocument, 'quiz' | 'user' | 'domain'> & {
  quiz: IQuiz;
  user: IUser;
  domain: IDomain;
};
