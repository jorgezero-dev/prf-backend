import { z } from "zod";

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    shortSummary: z.string().min(1, "Short summary is required"),
    description: z.string().min(1, "Description is required"),
    technologies: z
      .array(z.string().min(1, "Technology entry cannot be empty"))
      .min(1, "At least one technology is required"),
    role: z.string().min(1, "Role is required"),
    challenges: z.string().min(1, "Challenges are required"),
    liveDemoUrl: z
      .string()
      .url("Invalid URL format for live demo")
      .optional()
      .or(z.literal("")),
    sourceCodeUrl: z
      .string()
      .url("Invalid URL format for source code")
      .optional()
      .or(z.literal("")),
    images: z
      .array(
        z.object({
          url: z.string().url("Invalid URL for image"),
          altText: z.string().min(1, "Alt text is required for image"),
          isThumbnail: z.boolean().optional(),
        })
      )
      .min(1, "At least one image is required"),
    status: z.enum(["published", "draft"]),
    order: z
      .number()
      .int()
      .min(0, "Order must be a non-negative integer")
      .optional(),
    featured: z.boolean().optional(),
    links: z
      .array(
        z.object({
          name: z.string().min(1, "Link name is required"),
          url: z.string().url("Invalid URL for link"),
        })
      )
      .optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const createBlogPostSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    featuredImageUrl: z
      .string()
      .url("Invalid URL for featured image")
      .optional()
      .or(z.literal("")),
    categories: z.array(z.string()).min(1, "At least one category is required"),
    tags: z.array(z.string()).optional(),
    status: z.enum(["published", "draft"]),
    slug: z
      .string()
      .min(1, "Slug is required")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
  }),
});

export const updateProfileSchema = z.object({
  body: z
    .object({
      biography: z.string().optional(),
      skills: z
        .array(
          z.object({
            category: z.string().min(1, "Skill category is required"),
            items: z
              .array(z.string().min(1, "Skill item is required"))
              .min(1, "At least one skill item is required"),
          })
        )
        .optional(),
      education: z
        .array(
          z.object({
            institution: z.string().min(1, "Institution is required"),
            degree: z.string().min(1, "Degree is required"),
            fieldOfStudy: z.string().optional(),
            startDate: z.string().optional(), // Or z.date() if you parse dates
            endDate: z.string().optional(), // Or z.date()
            description: z.string().optional(),
          })
        )
        .optional(),
      workExperience: z
        .array(
          z.object({
            company: z.string().min(1, "Company name is required"),
            position: z.string().min(1, "Position is required"),
            startDate: z.string().optional(), // Or z.date()
            endDate: z.string().optional(), // Or z.date()
            description: z.string().optional(),
            responsibilities: z.array(z.string()).optional(),
          })
        )
        .optional(),
      profilePictureUrl: z
        .string()
        .url("Invalid URL for profile picture")
        .optional()
        .or(z.literal("")),
      socialLinks: z
        .array(
          z.object({
            platform: z.string().min(1, "Platform name is required"),
            url: z.string().url("Invalid URL for social link"),
          })
        )
        .optional(),
      contactEmail: z.string().email("Invalid contact email format").optional(),
    })
    .partial(), // .partial() makes all fields in the body optional
});

export const contactFormSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    subject: z.string().optional(),
    message: z.string().min(1, "Message is required"),
    captchaToken: z.string().optional(), // Assuming CAPTCHA is optional as per B-FR6.1
  }),
});

export const updateResumeUrlSchema = z.object({
  body: z.object({
    resumeUrl: z
      .string()
      .url("Invalid URL format for resume")
      .min(1, "Resume URL is required"),
  }),
});

// Schema for updating an existing project (all fields optional)
export const updateProjectSchema = createProjectSchema.partial();

// Schema for updating an existing blog post (all fields optional)
export const updateBlogPostSchema = createBlogPostSchema.partial();
