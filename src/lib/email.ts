import nodemailer from "nodemailer";

function getTransporter() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Sends a clean, branded Password Reset OTP Email
 */
export async function sendPasswordResetOTP(email: string, name: string, otp: string): Promise<boolean> {
  try {
    const user = process.env.GMAIL_USER?.trim();
    const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");

    if (!user || !pass) {
      console.warn("Gmail SMTP credentials not set in .env.local. Fallback OTP:", otp);
      return false;
    }

    const transporter = getTransporter();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #F0D9E7; border-radius: 12px; background: #FFFDFE;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #520D38; margin: 0; font-size: 24px;">Lakshmi Agency</h2>
          <p style="color: #D4AF37; font-size: 13px; font-style: italic; margin: 4px 0 0 0;">Your Needs... Our Priority...</p>
        </div>
        <p style="color: #333; font-size: 14px;">Namaste <strong>${name}</strong>,</p>
        <p style="color: #555; font-size: 13px; line-height: 1.5;">We received a request to reset your password for your Lakshmi Agency account. Use the verification code below to proceed. This code is valid for 15 minutes.</p>
        <div style="text-align: center; margin: 25px 0;">
          <span style="display: inline-block; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #520D38; background: #FFF0F7; border: 1.5px dashed #E83A89; padding: 12px 24px; border-radius: 8px;">
            ${otp}
          </span>
        </div>
        <p style="color: #888; font-size: 12px;">If you did not request this password reset, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #F3DBE9; margin: 20px 0;">
        <p style="text-align: center; font-size: 11px; color: #AAA;">&copy; 2026 Lakshmi Agency. All rights reserved.</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Lakshmi Agency" <${user}>`,
      to: email,
      subject: `[Lakshmi Agency] Password Reset Code: ${otp}`,
      html: htmlContent,
    });

    console.log("Password reset OTP email sent successfully to", email, "Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return false;
  }
}

/**
 * Sends a clean, branded Registration OTP Verification Email
 */
export async function sendRegistrationOTP(email: string, name: string, otp: string): Promise<boolean> {
  try {
    const user = process.env.GMAIL_USER?.trim();
    const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");

    if (!user || !pass) {
      console.warn("Gmail SMTP credentials not set in .env.local. Fallback OTP:", otp);
      return false;
    }

    const transporter = getTransporter();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1.5px solid #D4AF37; border-radius: 12px; background: #FFFDFE;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #520D38; margin: 0; font-size: 24px;">Lakshmi Agency</h2>
          <p style="color: #D4AF37; font-size: 13px; font-style: italic; margin: 4px 0 0 0;">Your Needs... Our Priority...</p>
        </div>
        <p style="color: #333; font-size: 14px;">Welcome <strong>${name}</strong>!</p>
        <p style="color: #555; font-size: 13px; line-height: 1.5;">Thank you for registering on Lakshmi Agency. Please use the verification code below to verify your email and complete your registration:</p>
        <div style="text-align: center; margin: 25px 0;">
          <span style="display: inline-block; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #520D38; background: #FFF0F7; border: 1.5px dashed #E83A89; padding: 12px 24px; border-radius: 8px;">
            ${otp}
          </span>
        </div>
        <p style="color: #888; font-size: 12px;">This code is valid for 15 minutes. If you did not request this registration, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #F3DBE9; margin: 20px 0;">
        <p style="text-align: center; font-size: 11px; color: #AAA;">&copy; 2026 Lakshmi Agency. All rights reserved.</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Lakshmi Agency" <${user}>`,
      to: email,
      subject: `[Lakshmi Agency] Verify Your Account: ${otp}`,
      html: htmlContent,
    });

    console.log("Registration OTP email delivered successfully to", email, "Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send Registration OTP email:", error);
    return false;
  }
}
