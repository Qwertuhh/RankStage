#!/usr/bin/env ts-node
import 'dotenv/config';
import connectToDatabase from '@/lib/db';
import { deleteUserAndRelatedData } from '../src/lib/services/userService';
import { Types } from 'mongoose';

async function main() {
  // Check if user ID is provided as command line argument
  const userId = process.argv[2];
  
  if (!userId) {
    console.error('Error: User ID is required');
    console.log('Usage: ts-node deleteUser.ts <userId>');
    process.exit(1);
  }

  if (!Types.ObjectId.isValid(userId)) {
    console.error('Error: Invalid user ID format');
    process.exit(1);
  }

  try {
    // Connect to the database
    await connectToDatabase();
    console.log('Connected to database');

    console.log(`Deleting user ${userId} and all related data...`);
    
    // Delete the user and all related data
    await deleteUserAndRelatedData(userId);
    
    console.log('✅ User and all related data deleted successfully');
  } catch (error) {
    console.error('Error deleting user:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    process.exit(0);
  }
}

// Run the script
main().catch(console.error);
