import { getMailFrom } from "@/lib/mailer";

export function getAccountDeletedTemplate(userEmail: string, userName: string) {
  const { name: fromName } = getMailFrom();
  
  return {
    from: `"${fromName}" <${getMailFrom().address}>`,
    to: userEmail,
    subject: 'Your Account Has Been Deleted',
    text: `
      Hello ${userName || 'there'},

      We're writing to inform you that your account has been successfully deleted from ${fromName}.
      
      All your personal data has been permanently removed from our systems in accordance with our privacy policy.
      
      If you did not request this action or believe this was done in error, please contact our support team immediately.
      
      Best regards,
      The ${fromName} Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Account Deletion Confirmation</h2>
        <p>Hello ${userName || 'there'},</p>
        
        <p>We're writing to inform you that your account has been successfully deleted from ${fromName}.</p>
        
        <p>All your personal data has been permanently removed from our systems in accordance with our privacy policy.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0;">
          <p style="margin: 0; color: #721c24;">
            <strong>Important:</strong> If you did not request this action or believe this was done in error, 
            please contact our support team immediately.
          </p>
        </div>
        
        <p>Best regards,<br>The ${fromName} Team</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #6c757d;">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `
  };
}
