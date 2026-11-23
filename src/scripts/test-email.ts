import nodemailer from "nodemailer";

const user = "lakshmiagencyapp@gmail.com";
const pass = "khwhatanjuowavhe";

async function testEmail() {
  console.log("Verifying Gmail SMTP connection for:", user);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  try {
    await transporter.verify();
    console.log("SUCCESS! Gmail SMTP connection verified successfully!");

    console.log("Sending test confirmation email to:", user);
    const info = await transporter.sendMail({
      from: `"Lakshmi Agency" <${user}>`,
      to: user,
      subject: "Lakshmi Agency - Gmail SMTP & Nodemailer Verified",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 25px; border: 1.5px solid #D4AF37; border-radius: 12px; background: #FFFDFE;">
          <h2 style="color: #520D38; margin: 0;">Lakshmi Agency</h2>
          <p style="color: #D4AF37; font-style: italic; margin-top: 4px;">Your Needs... Our Priority...</p>
          <hr style="border: none; border-top: 1px solid #F0D9E7; margin: 15px 0;">
          <p style="color: #333; font-size: 14px;">This is confirmation that your official Gmail App Password and Nodemailer configuration are <strong>100% active and verified</strong>.</p>
          <p style="color: #555; font-size: 13px;">The 6-digit Forgot Password OTP system is now fully live across the platform.</p>
          <div style="margin-top: 20px; font-size: 11px; color: #888;">&copy; 2026 Lakshmi Agency. All rights reserved.</div>
        </div>
      `,
    });
    console.log("Test email successfully delivered! Message ID:", info.messageId);
  } catch (error) {
    console.error("SMTP Error:", error);
  }
}

testEmail();
