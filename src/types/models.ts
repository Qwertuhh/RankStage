import { Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface IDomain extends Document {
  name: string;
  description: string;
  createdBy: IUser['_id'];
  users: Array<{
    user: IUser['_id'];
    status: 'pending' | 'approved' | 'rejected';
  }>;
  createdAt: Date;
}

export interface IPerformance extends Document {
  user: IUser['_id'];
  domain: IDomain['_id'];
  score: number;
  feedback?: string;
  createdAt: Date;
}
