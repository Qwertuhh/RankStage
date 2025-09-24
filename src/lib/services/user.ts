import { Types } from "mongoose";
import connectToDatabase from "@/lib/db";
import { User, Submission, Domain, Quiz } from "@/models";
import logger from "@/lib/logger";
import { getMailer } from "@/lib/mailer";
import { getAccountDeletedTemplate } from "@/lib/templates/account-deleted";

/**
 * Deletes a user and all their related data
 * @param userId - The ID of the user to delete
 */
async function deleteUserAndRelatedData(userId: string) {
  if (!Types.ObjectId.isValid(userId)) {
    logger.error("Invalid user ID");
    throw new Error("Invalid user ID");
  }

  try {
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      logger.warn("User not found");
      return;
    }

    const avatarResponse = await fetch(`/api/auth/avatar/${user.avatar}`, {
      method: "DELETE",
    });
    if (!avatarResponse.ok) {
      logger.error("Error deleting avatar");
      return;
    }

    // Delete promises concurrently and handle success and failures
    const deletePromises = [
      Submission.deleteMany({ user: userId }),
      Domain.deleteMany({ user: userId }),
      Quiz.deleteMany({ user: userId }),
      fetch(`/api/auth/avatar/${user.avatar}`, { method: "DELETE" }),
    ];

    try {
      await Promise.allSettled(deletePromises);
    } catch (error) {
      logger.error("Error deleting user and related data:", error);
      throw error;
    }

    // Get user email before deletion for notification
    const userEmail = user.email;
    const userName = `${user.firstName} ${user.lastName}`.trim();

    // Delete the user
    const deleteUser = await User.deleteOne({ _id: userId });
    if (!deleteUser.deletedCount) {
      logger.warn("User not deleted");
      return;
    }

    logger.info(
      `User and related data deleted successfully for user ID: ${userId}`
    );

    // Send account deletion notification email
    try {
      const mailer = getMailer();
      const mailOptions = getAccountDeletedTemplate(userEmail, userName);

      await mailer.sendMail(mailOptions);
      logger.info(`Account deletion email sent to ${userEmail}`);
    } catch (emailError) {
      // Log but don't fail the operation if email sending fails
      logger.error("Failed to send account deletion email:", emailError);
    }
  } catch (error) {
    logger.error("Error connecting to database:", error);
    throw error;
  }
}

export { deleteUserAndRelatedData };
