export type OtpToken = {
  token: string; // JWT string containing OTP hash and email, exp set
  expiresAt: number; // ms epoch
};
