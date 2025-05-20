import nodemailer from "nodemailer";
import config from "../config/index"; // Corrected import path

interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html: string;
}

// Create a transporter object using SMTP transport
// You'll need to configure your SMTP settings in .env and access them via config.ts
// Example using a generic SMTP setup; for services like SendGrid, the setup might differ.
const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: config.smtpSecure, // true for 465, false for other ports
  auth: {
    user: config.smtpUser, // generated ethereal user or your email user
    pass: config.smtpPassword, // generated ethereal password or your email password
  },
});

/**
 * Sends an email.
 * @param mailOptions Options for the email (to, subject, text, html).
 */
export const sendEmail = async (mailOptions: MailOptions): Promise<void> => {
  try {
    // Verify connection configuration
    // await transporter.verify(); // Optional: verify connection configuration
    // console.log("Email transporter configured correctly.");

    const info = await transporter.sendMail({
      from: `"${config.emailFromName || "Portfolio Contact"}" <${
        config.emailFromAddress || config.smtpUser
      }>`,
      to: mailOptions.to,
      subject: mailOptions.subject,
      text: mailOptions.text,
      html: mailOptions.html,
    });
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
    // Rethrow the error or handle it as per your application's error handling strategy
    // For now, we'll rethrow to be caught by the global error handler if this is part of a request
    // Or to be handled by the caller if used in a background job
    throw new Error("Failed to send email.");
  }
};

// Example usage (for testing purposes, can be removed):
/*
if (require.main === module) {
    sendEmail({
        to: 'test@example.com',
        subject: 'Test Email from Nodemailer',
        text: 'Hello world?',
        html: '<b>Hello world?</b>'
    }).catch(console.error);
}
*/
