import jwt, { JwtPayload } from "jsonwebtoken";
import logger from "@/lib/logger";
import { createHmac, timingSafeEqual } from 'crypto';

const OTP_SECRET = process.env.OTP_SECRET;

async function compareOTP(email: string, otp: string, tokenInput: string | { token: string }) {
     if (!OTP_SECRET) {
       return {
           success: false,
           valid: false,
           error: "Server misconfigured: OTP_SECRET is missing",
         };
     }

     // Normalize token into a JWT string
     const tokenStr =
       typeof tokenInput === "string" ? tokenInput : tokenInput.token;

     try {
       const decoded = jwt.verify(tokenStr, OTP_SECRET, {
         algorithms: ["HS256"],
       }) as JwtPayload;

       // Check embedded email matches request email
       if (!decoded?.email || decoded.email !== email) {
         logger.info(
           `[auth/verify-email/verifier] Email mismatch for ${email}`
         );
         return ({ success: true, valid: false });
       }

       // Recompute hash from submitted otp
       const expectedHash = createHmac("sha256", OTP_SECRET)
         .update(`${email}:${otp}`)
         .digest("hex");
       const providedHash = decoded.otpHash;

       const valid =
         typeof providedHash === "string" &&
         providedHash.length === expectedHash.length &&
         timingSafeEqual(
           Buffer.from(providedHash, "hex"),
           Buffer.from(expectedHash, "hex")
         );

       logger.info(
         `[auth/verify-email/verifier] Verification for ${email}: ${
           valid ? "valid" : "invalid"
         }`
       );
       return { success: true, valid };
     } catch {
       // On JWT errors (expired, invalid), treat as invalid but successful response
       logger.warn(
         `[auth/verify-email/verifier] Invalid or expired token for ${email}`
       );
       return ({ success: true, valid: false });
     }
}

export default compareOTP;
