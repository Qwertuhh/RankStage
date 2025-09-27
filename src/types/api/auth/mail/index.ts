enum MailRequestType {
  ChangePassword = "change-password",
  SignUp = "sign-up",
  SignIn = "sign-in",
}

interface SendOtpRequest {
  email: string;
  name?: string;
  otp: string;
  requestType: MailRequestType;
}

export type { SendOtpRequest };
export { MailRequestType };