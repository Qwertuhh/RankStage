import mongoose from "mongoose";
import { UserRole } from "@/types/enums";
import { IUser, UserDocument, PopulatedUserDocument } from "@/types/models";
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    avatar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'avatars.files',
      default: null,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    location: {
      type: String,
      maxlength: [100, 'Location cannot exceed 100 characters'],
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        const { password, __v, ...rest } = ret as { password?: string; __v?: number };
        return rest;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        const { password, __v, ...rest } = ret as { password?: string; __v?: number };
        return rest;
      },
    },
  }
);

// Add indexes
// userSchema.index({ email: 1 }, { unique: true });
// userSchema.index({ role: 1 });

// Pre-save hook to hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// At the bottom of the file, replace the existing model definition with:
const User = mongoose.models.User || mongoose.model<UserDocument>('User', userSchema);

export type { UserDocument, PopulatedUserDocument };
export { User };
export default User;