import { getMailFrom } from '../mailer';

type VerificationEmailProps = {
  userEmail: string;
  userName: string;
  verificationCode: string;
  verificationUrl?: string;
  expiresIn?: string;
};

export function getVerificationEmailTemplate({
  userEmail,
  userName,
  verificationCode,
  verificationUrl,
  expiresIn = '15 minutes'
}: VerificationEmailProps) {
  const { name: fromName, address: fromAddress } = getMailFrom();
  const codeHtml = `
    <div style="
      display: inline-block;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 10px 20px;
      font-family: monospace;
      font-size: 24px;
      letter-spacing: 2px;
      margin: 10px 0;
      color: #0d6efd;
    ">
      ${verificationCode}
    </div>
  `;
  
  return {
    from: `"${fromName}" <${fromAddress}>`,
    to: userEmail,
    subject: `Your Verification Code - ${verificationCode}`,
    text: `
      Hello ${userName || 'there'},

      Your verification code is: ${verificationCode}
      
      This code will expire in ${expiresIn}. Please enter this code to verify your email address.
      
      If you didn't request this email, you can safely ignore it.
      
      Best regards,
      The ${fromName} Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0d6efd;">Verify Your Email Address</h2>
        <p>Hello ${userName || 'there'},</p>
        
        <p>Please use the following verification code to complete your registration:</p>
        
        <div style="text-align: center; margin: 25px 0;">
          ${codeHtml}
        </div>
        
        ${verificationUrl ? `
          <p>Or click the button below to verify your email:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${verificationUrl}" style="
              display: inline-block;
              background-color: #0d6efd;
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 4px;
              font-weight: bold;
            ">
              Verify Email Address
            </a>
          </div>
        ` : ''}
        
        <p>This code will expire in <strong>${expiresIn}</strong>. Please do not share this code with anyone.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #6c757d; margin: 20px 0;">
          <p style="margin: 0; color: #495057;">
            <strong>Note:</strong> If you didn't request this email, you can safely ignore it.
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
