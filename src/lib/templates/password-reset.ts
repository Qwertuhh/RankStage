import { getMailFrom } from '../mailer';

type PasswordResetProps = {
  userEmail: string;
  userName: string;
  resetUrl: string;
  expiresIn?: string;
};

export function getPasswordResetTemplate({
  userEmail,
  userName,
  resetUrl,
  expiresIn = '15 minutes'
}: PasswordResetProps) {
  const { name: fromName } = getMailFrom();
  
  return {
    from: `"${fromName}" <${getMailFrom().address}>`,
    to: userEmail,
    subject: 'Password Reset Request',
    text: `
      Hello ${userName || 'there'},

      We received a request to reset the password for your ${fromName} account.
      
      Please click the following link to reset your password:
      ${resetUrl}
      
      This link will expire in ${expiresIn}. If you didn't request this password reset, you can safely ignore this email.
      
      Best regards,
      The ${fromName} Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0d6efd;">Reset Your Password</h2>
        <p>Hello ${userName || 'there'},</p>
        
        <p>We received a request to reset the password for your ${fromName} account.</p>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${resetUrl}" style="
            display: inline-block;
            background-color: #0d6efd;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 4px;
            font-weight: bold;
          ">
            Reset Password
          </a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <div style="
          background-color: #f8f9fa;
          padding: 10px;
          border-radius: 4px;
          word-break: break-all;
          font-family: monospace;
          font-size: 12px;
          margin: 10px 0;
        ">
          ${resetUrl}
        </div>
        
        <p>This link will expire in <strong>${expiresIn}</strong>.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #6c757d; margin: 20px 0;">
          <p style="margin: 0; color: #495057;">
            <strong>Note:</strong> If you didn't request this password reset, you can safely ignore this email.
            Your password will remain unchanged.
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
