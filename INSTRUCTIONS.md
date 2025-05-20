Backend Functional Requirements (B-FR)
B-FR1: Authentication & Authorization API
B-FR1.1: Admin Login (POST /api/auth/login)
Purpose: Authenticate the administrator.
Request Body: { email: "string", password: "string" }
Processing:
Validate input (email format, password presence).
Find user by email in the database.
If user exists, compare hashed password using bcryptjs.compare().
If credentials are valid, generate a JSON Web Token (JWT) containing user ID and role (admin).
Response (Success - 200 OK): { token: "jwt_string", user: { id: "string", email: "string", name: "string" } }
Response (Error - 400 Bad Request): Invalid input format.
Response (Error - 401 Unauthorized): Invalid credentials.
Response (Error - 500 Internal Server Error): Server-side issues.
B-FR1.2: Verify Token Middleware (Applied to protected routes)
Purpose: Protect admin-only API endpoints.
Processing:
Extract JWT from Authorization header (Bearer token).
Verify JWT using jsonwebtoken.verify().
If valid, attach user information (e.g., req.user) to the request object.
If invalid or expired, deny access.
Response (Error - 401 Unauthorized): No token, invalid token, or expired token.
Response (Error - 403 Forbidden): Token valid, but user does not have required permissions (though for a single admin, this is less complex).
B-FR2: Profile & Site Information API (Protected Routes)
B-FR2.1: Get Profile Information (GET /api/profile)
Purpose: Fetch all profile data for the admin panel and public site (if structured this way).
Response (Success - 200 OK): { biography: "string_html_or_markdown", skills: [{ category: "string", items: ["string"] }], education: [{...}], workExperience: [{...}], profilePictureUrl: "string", socialLinks: [{ platform: "string", url: "string" }], contactEmail: "string" }
B-FR2.2: Update Profile Information (PUT /api/profile)
Purpose: Update the administrator's profile information.
Request Body: Same structure as B-FR2.1 response (or parts of it).
Processing:
Validate input data.
Update the corresponding document in the profiles (or site_settings) collection in MongoDB.
Response (Success - 200 OK): Updated profile object.
Response (Error - 400 Bad Request): Validation errors.
B-FR3: Project Management API
B-FR3.1: Create Project (POST /api/projects) (Protected)
Purpose: Add a new project.
Request Body: { title: "string", shortSummary: "string", description: "string_html_or_markdown", technologies: ["string"], role: "string", challenges: "string", liveDemoUrl: "string", sourceCodeUrl: "string", images: [{ url: "string", altText: "string", isThumbnail: boolean }], status: "published" | "draft", order: number, featured: boolean }
Processing:
Validate input.
Save new project document to MongoDB projects collection.
Response (Success - 201 Created): The newly created project object.
B-FR3.2: Get All Projects (Public) (GET /api/projects)
Purpose: Fetch all published projects for the public site.
Query Parameters: ?category=string (for filtering), ?page=number, ?limit=number (for pagination).
Processing:
Fetch projects where status: "published".
Apply filtering if category query param is present.
Apply sorting (e.g., by order field, then createdAt descending).
Implement pagination.
Response (Success - 200 OK): { data: [project_objects], total: number, page: number, limit: number, totalPages: number }
B-FR3.3: Get All Projects (Admin) (GET /api/admin/projects) (Protected)
Purpose: Fetch all projects for the admin panel, including drafts.
Query Parameters: ?status=string, ?page=number, ?limit=number, ?sortBy=string, ?sortOrder=asc|desc.
Processing:
Fetch projects, allow filtering by any status.
Implement pagination and sorting as per query params.
Response (Success - 200 OK): { data: [project_objects], total: number, page: number, limit: number, totalPages: number }
B-FR3.4: Get Single Project by ID/Slug (Public) (GET /api/projects/:idOrSlug)
Purpose: Fetch a single published project by its ID or a unique slug.
Processing:
Find project by ID or slug where status: "published".
Response (Success - 200 OK): Project object.
Response (Error - 404 Not Found): Project not found or not published.
B-FR3.5: Get Single Project by ID (Admin) (GET /api/admin/projects/:id) (Protected)
Purpose: Fetch a single project by ID for the admin panel, regardless of status.
Processing: Find project by ID.
Response (Success - 200 OK): Project object.
Response (Error - 404 Not Found): Project not found.
B-FR3.6: Update Project (PUT /api/projects/:id) (Protected)
Purpose: Modify an existing project.
Request Body: Same as B-FR3.1 (or partial update using PATCH).
Processing:
Validate input.
Find project by ID and update it in MongoDB.
Response (Success - 200 OK): The updated project object.
Response (Error - 404 Not Found): Project not found.
B-FR3.7: Delete Project (DELETE /api/projects/:id) (Protected)
Purpose: Remove a project.
Processing: Find project by ID and delete it from MongoDB.
Response (Success - 204 No Content):
Response (Error - 404 Not Found): Project not found.
B-FR4: Blog Post Management API
B-FR4.1: Create Blog Post (POST /api/blog) (Protected)
Purpose: Add a new blog post.
Request Body: { title: "string", content: "string_html_or_markdown", featuredImageUrl: "string", categories: ["string"], tags: ["string"], status: "published" | "draft", slug: "string_unique", metaTitle: "string", metaDescription: "string" } (publicationDate auto-generated or settable)
Processing:
Validate input. Ensure slug uniqueness.
Save new blog post document to MongoDB blog_posts collection.
Response (Success - 201 Created): The newly created blog post object.
B-FR4.2: Get All Blog Posts (Public) (GET /api/blog)
Purpose: Fetch all published blog posts.
Query Parameters: ?category=string, ?tag=string, ?page=number, ?limit=number, ?search=string.
Processing:
Fetch posts where status: "published".
Apply filtering and search.
Sort by publicationDate descending.
Implement pagination.
Response (Success - 200 OK): { data: [blog_post_objects], total: number, page: number, limit: number, totalPages: number }
B-FR4.3: Get All Blog Posts (Admin) (GET /api/admin/blog) (Protected)
Purpose: Fetch all blog posts for the admin panel, including drafts.
Query Parameters: ?status=string, ?page=number, ?limit=number, ?sortBy=string, ?sortOrder=asc|desc.
Response (Success - 200 OK): { data: [blog_post_objects], total: number, page: number, limit: number, totalPages: number }
B-FR4.4: Get Single Blog Post by Slug (Public) (GET /api/blog/:slug)
Purpose: Fetch a single published blog post by its unique slug.
Processing: Find post by slug where status: "published".
Response (Success - 200 OK): Blog post object.
Response (Error - 404 Not Found): Post not found or not published.
B-FR4.5: Get Single Blog Post by ID (Admin) (GET /api/admin/blog/:id) (Protected)
Purpose: Fetch a single blog post by ID for the admin panel, regardless of status.
Processing: Find post by ID.
Response (Success - 200 OK): Blog post object.
Response (Error - 404 Not Found): Post not found.
B-FR4.6: Update Blog Post (PUT /api/blog/:id) (Protected)
Purpose: Modify an existing blog post.
Request Body: Same as B-FR4.1 (or partial).
Processing:
Validate input. Ensure slug uniqueness if changed.
Find post by ID and update it in MongoDB.
Response (Success - 200 OK): The updated blog post object.
Response (Error - 404 Not Found): Post not found.
B-FR4.7: Delete Blog Post (DELETE /api/blog/:id) (Protected)
Purpose: Remove a blog post.
Processing: Find post by ID and delete it.
Response (Success - 204 No Content):
Response (Error - 404 Not Found): Post not found.
B-FR4.8: Get Unique Blog Categories/Tags (GET /api/blog/categories, GET /api/blog/tags)
Purpose: Fetch unique categories and tags for filtering UI on the frontend.
Processing: Aggregate distinct values from the categories and tags fields of published posts.
Response (Success - 200 OK): { data: ["string"] }
B-FR5: Resume Management API
B-FR5.1: Upload/Update Resume (POST /api/resume) (Protected)
Purpose: Allow admin to upload a new resume PDF. The backend will store a reference (URL) to this file. The actual file upload might be handled directly by the frontend to a service like Cloudinary, or the backend could proxy it. For simplicity here, let's assume the frontend provides a URL of the uploaded file. If the backend handles the file stream, multer or similar would be used.
Request Body: { resumeUrl: "string" }
Processing:
Validate the URL.
Update a specific document/field in MongoDB (e.g., in site_settings) with this new resumeUrl.
Response (Success - 200 OK): { message: "Resume URL updated successfully", resumeUrl: "string" }
B-FR5.2: Get Resume URL (GET /api/resume/url)
Purpose: Provide the frontend with the current resume URL for the download link.
Processing: Fetch the resumeUrl from MongoDB.
Response (Success - 200 OK): { resumeUrl: "string" }
B-FR6: Contact Form API
B-FR6.1: Submit Contact Form (POST /api/contact)
Purpose: Receive contact form submissions.
Request Body: { name: "string", email: "string", subject: "string" (optional), message: "string", captchaToken: "string" (optional, if using CAPTCHA) }
Processing:
Validate input (name, email format, message).
(Optional) Verify CAPTCHA token with a third-party service.
Send an email to the administrator's configured email address with the form details. (Using a service like SendGrid, Nodemailer with an SMTP provider).
(Optional) Save the submission to a contact_submissions collection in MongoDB.
Response (Success - 200 OK): { message: "Message sent successfully!" }
Response (Error - 400 Bad Request): Validation errors, CAPTCHA verification failed.
Response (Error - 500 Internal Server Error): Email sending failed, DB save failed.
B-FR6.2: Get Contact Submissions (GET /api/admin/contact-submissions) (Protected, Optional)
Purpose: If submissions are stored, allow admin to view them.
Query Parameters: ?page=number, ?limit=number.
Response (Success - 200 OK): { data: [submission_objects], total: number, ... }
B-FR7: Admin Dashboard API (Protected)
B-FR7.1: Get Dashboard Stats (GET /api/admin/dashboard/stats)
Purpose: Provide summary statistics for the admin dashboard.
Processing:
Count total projects.
Count total blog posts (published and draft).
(Optional) Count contact submissions (if stored).
Response (Success - 200 OK): { totalProjects: number, totalPublishedPosts: number, totalDraftPosts: number, ... }
Backend Non-Functional Requirements (B-NFR)
B-NFR1: Performance:
B-NFR1.1: API Response Time: Average API response time for GET requests should be < 200ms under normal load (excluding external API calls like email). CRUD operations < 500ms.
B-NFR1.2: Database Query Optimization: Mongoose queries should be optimized using appropriate indexing on frequently queried fields (e.g., status, slug, publicationDate, order).
B-NFR2: Security:
B-NFR2.1: Password Hashing: Admin passwords must be hashed using bcryptjs with a sufficient salt round.
B-NFR2.2: JWT Security: JWTs should be signed with a strong secret key, have a reasonable expiration time, and ideally be transmitted via HTTPS-only cookies or securely handled in frontend state.
B-NFR2.3: Input Validation: All incoming data from API requests must be rigorously validated (e.g., using a library like Joi, Zod, or Express Validator) to prevent malformed data and common injection vulnerabilities (though Mongoose provides some schema validation).
B-NFR2.4: Protection against Common Vulnerabilities: Implement measures against OWASP Top 10 (e.g., NoSQL injection (Mongoose helps), XSS (by not embedding user content directly without sanitization, though less of an issue if admin is the only input source), CSRF (if using cookie-based sessions)).
B-NFR2.5: HTTPS Enforcement: All API communication must occur over HTTPS (Render typically handles this at the load balancer level).
B-NFR2.6: Rate Limiting: Implement rate limiting on sensitive endpoints like login (/api/auth/login) and contact form submission (/api/contact) to prevent abuse.
B-NFR2.7: CORS Configuration: Configure cors middleware properly to only allow requests from your Vercel frontend domain in production.
B-NFR2.8: Environment Variables: All sensitive information (DB connection string, JWT secret, API keys for email services) must be stored in environment variables (.env file, managed by Render).
B-NFR3: Scalability:
B-NFR3.1: Statelessness: API should be stateless to allow for horizontal scaling if needed (Render can scale instances).
B-NFR3.2: Efficient Database Connections: Manage MongoDB connections efficiently (Mongoose handles connection pooling).
B-NFR4: Reliability & Availability:
B-NFR4.1: Error Handling: Implement robust global error handling middleware in Express to catch unhandled exceptions and return standardized error responses.
B-NFR4.2: Logging: Implement comprehensive logging for requests, errors, and significant events (e.g., using Winston or Morgan). Render usually provides log aggregation.
B-NFR4.3: Database Connection Retries: Ensure Mongoose is configured to attempt reconnection if the database connection drops.
B-NFR5: Maintainability:
B-NFR5.1: Modular Code Structure: Organize backend code into logical modules (e.g., routes, controllers, services, models, middleware).
B-NFR5.2: TypeScript Usage: Leverage TypeScript for strong typing, improved code quality, and easier refactoring.
B-NFR5.3: Consistent Naming Conventions: Follow consistent naming conventions for files, variables, functions, and API endpoints.
B-NFR5.4: API Documentation: (Internal) Keep API endpoints well-documented within the code or using a tool like Swagger/OpenAPI if complexity grows.
B-NFR6: Data Integrity & Validation:
B-NFR6.1: Schema Validation: Utilize Mongoose schemas for robust data validation at the database level.
B-NFR6.2: Uniqueness Constraints: Enforce uniqueness for fields like email (for admin), project slugs, and blog post slugs at the database level.
B-NFR7: Deployability:
B-NFR7.1: Environment Configuration: Easy configuration for different environments (development, production) using .env files and Render's environment variable management.
B-NFR7.2: Build Process: Clear build process (tsc) for TypeScript compilation before deployment. ts-node-dev for development.
