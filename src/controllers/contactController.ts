import { Request, Response, NextFunction } from "express";
import ContactSubmission from "../models/ContactSubmission";
import ApiError from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { sendEmail } from "../services/emailService"; // Import the sendEmail utility
import config from "../config/index"; // Import config to access ADMIN_EMAIL

// B-FR6.1: Submit Contact Form
export const submitContactForm = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, subject, message } = req.body;

    // Basic validation (consider using a validation library like Zod or Joi for more complex needs)
    if (!name || !email || !message) {
      return next(new ApiError(400, "Name, email, and message are required"));
    }
    if (typeof email !== "string" || !email.includes("@")) {
      return next(new ApiError(400, "Invalid email format"));
    }
    // Add more validation as needed (e.g., length checks, specific formats)

    // TODO: Add CAPTCHA verification if implemented (B-NFR2.6)

    try {
      // Save submission to database
      const submission = await ContactSubmission.create({
        name,
        email,
        subject,
        message,
      });

      // Send email notification to admin
      if (config.adminEmail) {
        const emailSubjectToAdmin = subject
          ? `New Contact Form Submission: ${subject}`
          : "New Contact Form Submission";
        const emailHtmlToAdmin = `
          <h1>New Contact Form Submission</h1>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || "(No subject provided)"}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <hr>
          <p><em>Submission ID: ${submission._id}</em></p>
        `;
        const emailTextToAdmin = `New Contact Form Submission:\nName: ${name}\nEmail: ${email}\nSubject: ${
          subject || "(No subject provided)"
        }\nMessage: ${message}\nSubmission ID: ${submission._id}`;

        await sendEmail({
          to: config.adminEmail, // Send to the admin
          subject: emailSubjectToAdmin,
          text: emailTextToAdmin,
          html: emailHtmlToAdmin,
        });
      } else {
        console.warn(
          "ADMIN_EMAIL is not configured. Skipping email notification to admin."
        );
      }

      // Optional: Send a confirmation email to the user who submitted the form
      if (config.emailFromAddress) {
        // Check if a FROM address is configured
        const confirmationSubject = "Thank you for your message";
        const confirmationHtml = `
          <h1>Thank You, ${name}!</h1>
          <p>We have received your message and will get back to you shortly if a response is needed.</p>
          <p><strong>Your submission details:</strong></p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || "(No subject provided)"}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <hr>
          <p><em>${config.emailFromName}</em></p>
        `;
        const confirmationText = `Thank You, ${name}!\nWe have received your message and will get back to you shortly if a response is needed.\nYour submission details:\nEmail: ${email}\nSubject: ${
          subject || "(No subject provided)"
        }\nMessage: ${message}\n${config.emailFromName}`;

        await sendEmail({
          to: email, // Send to the user who submitted the form
          subject: confirmationSubject,
          text: confirmationText,
          html: confirmationHtml,
        });
      } else {
        console.warn(
          "EMAIL_FROM_ADDRESS is not configured. Skipping confirmation email to user."
        );
      }

      res.status(201).json({
        success: true,
        message: "Message sent successfully! We will get back to you shortly.", // Updated message
        data: submission, // Optional: return the submission data
      });
    } catch (error) {
      console.error("Error processing contact form:", error);
      // If email sending fails after DB save, the submission is still in the DB.
      // The error will be caught by asyncHandler and a generic server error will be returned.
      // For a production app, you might want more sophisticated error handling here,
      // like logging the specific step that failed (DB save vs. admin email vs. user email).
      return next(
        new ApiError(
          500,
          "Failed to process your request. Please try again later."
        )
      );
    }
  }
);

// B-FR6.2: Get Contact Submissions (Admin)
export const getContactSubmissions = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const submissions = await ContactSubmission.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalSubmissions = await ContactSubmission.countDocuments();
    const totalPages = Math.ceil(totalSubmissions / limit);

    res.status(200).json({
      success: true,
      data: submissions,
      pagination: {
        total: totalSubmissions,
        page,
        limit,
        totalPages,
      },
    });
  }
);

// Optional: Mark a submission as read/unread
export const updateSubmissionStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { isRead } = req.body;

    if (typeof isRead !== "boolean") {
      return next(new ApiError(400, "isRead must be a boolean"));
    }

    const submission = await ContactSubmission.findByIdAndUpdate(
      id,
      { isRead },
      { new: true, runValidators: true }
    );

    if (!submission) {
      return next(new ApiError(404, "Submission not found"));
    }

    res.status(200).json({
      success: true,
      message: "Submission status updated",
      data: submission,
    });
  }
);

// Optional: Delete a submission
export const deleteSubmission = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const submission = await ContactSubmission.findByIdAndDelete(id);

    if (!submission) {
      return next(new ApiError(404, "Submission not found"));
    }

    res.status(204).json({
      // 204 No Content for successful deletion
      success: true,
      message: "Submission deleted successfully",
    });
  }
);
