const nodemailer = require("nodemailer");

const createTransporter = async () => {
  // Use provided SMTP config or fallback to Ethereal mock for development
  let transporter;
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate test account for dev
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
    console.warn("Using Ethereal Mail for mock emails. Check console logs for email previews.");
  }
  return transporter;
};

exports.sendOTPEmail = async (email, otp, type = 'login') => {
  try {
    const transporter = await createTransporter();

    const subject = type === 'email_change'
      ? "Change Your Email Address - Digi Ratna WhatsApp"
      : "Your Login OTP - Digi Ratna WhatsApp";

    const title = type === 'email_change'
      ? "Email Address Change Request"
      : "Login to Digi Ratna WhatsApp";

    const bodyText = type === 'email_change'
      ? `Your OTP to change your email address is: ${otp}. It is valid for 10 minutes. If you didn't request this, please ignore this email.`
      : `Your OTP for login is: ${otp}. It is valid for 5 minutes.`;

    const info = await transporter.sendMail({
      from: `Digi Ratna WhatsApp <${process.env.SMTP_FROM || "noreply@whatsappsaas.com"}>`,
      to: email,
      replyTo: process.env.SMTP_REPLYTO,
      subject: subject,
      text: bodyText,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #4F46E5;">${title}</h2>
          <p>${type === 'email_change' ? 'You requested to change your email address. Use the OTP below to verify:' : 'Your One-Time Password (OTP) for login is:'}</p>
          <div style="background: #f3f4f6; padding: 15px; font-size: 24px; font-weight: bold; color: #4F46E5; letter-spacing: 5px; text-align: center; border-radius: 8px;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #666; margin-top: 20px;">
            This OTP is valid for ${type === 'email_change' ? '10' : '5'} minutes. Do not share it with anyone.
          </p>
        </div>
      `,
    });

    console.log("Message sent: %s", info.messageId);
    if (!process.env.SMTP_USER) {
      // Ethereal gives a preview URL
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
};
