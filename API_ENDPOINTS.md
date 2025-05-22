# API Endpoint Documentation

This document provides a detailed specification for all backend API endpoints, including request/response structures, authentication requirements, and potential error codes.

## Table of Contents

1.  [Authentication](#authentication)
2.  [Profile](#profile)
3.  [Projects](#projects)
4.  [Blog Posts](#blog-posts)
5.  [Resume](#resume)
6.  [Contact](#contact)
7.  [Admin Dashboard](#admin-dashboard)

---

## 1. Authentication

### 1.1 Login

- **Endpoint:** `POST /api/auth/login`
- **Description:** Authenticates an admin user and returns a JWT token.
- **Authentication:** Public
- **Rate Limiting:** Applied (stricter limit for auth routes).
- **Request Body:**
  - `email` (string, required, valid email format): User's email.
  - `password` (string, required): User's password.
  ```json
  {
    "email": "admin@example.com",
    "password": "password123"
  }
  ```
- **Success Response (200 OK):**
  - `token` (string): JWT token for authenticated sessions.
  - `user` (object): User details.
    - `id` (string): User ID.
    - `email` (string): User email.
    - `name` (string): User name.
    - `role` (string): User role (e.g., "admin").
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60c72b2f9b1e8a001c8e4d8b",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Missing email or password, invalid email format.
    ```json
    { "message": "Email and password are required." }
    ```
    ```json
    { "message": "Invalid email format." }
    ```
    ```json
    // Zod validation error
    {
      "message": "Validation failed",
      "errors": [
        { "path": ["body", "email"], "message": "Invalid email format" },
        { "path": ["body", "password"], "message": "Password is required" }
      ]
    }
    ```
  - `401 Unauthorized`: Invalid credentials.
    ```json
    { "message": "Invalid credentials." }
    ```
  - `429 Too Many Requests`: Rate limit exceeded.
  - `500 Internal Server Error`: Server-side error.

---

## 2. Profile

### 2.1 Get Profile

- **Endpoint:** `GET /api/profile`
- **Description:** Retrieves the admin's profile information.
- **Authentication:** Public
- **Request Body:** None.
- **Success Response (200 OK):**
  - Returns the profile object (structure based on `IProfile` model).
  ```json
  {
    "_id": "60c72b2f9b1e8a001c8e4d8c",
    "biography": "Experienced web developer...",
    "skills": [{ "category": "Frontend", "items": ["React", "Vue"] }],
    "education": [
      {
        "institution": "University of Example",
        "degree": "BSc Computer Science",
        "fieldOfStudy": "Computer Science",
        "startDate": "2010-09-01",
        "endDate": "2014-06-01",
        "description": "Focused on web technologies."
      }
    ],
    "workExperience": [
      {
        "company": "Tech Solutions Inc.",
        "position": "Senior Developer",
        "startDate": "2016-01-01",
        "endDate": "2020-12-31",
        "responsibilities": ["Led a team...", "Developed features..."]
      }
    ],
    "profilePictureUrl": "https://example.com/profile.jpg",
    "socialLinks": [
      { "platform": "LinkedIn", "url": "https://linkedin.com/in/admin" }
    ],
    "contactEmail": "admin-contact@example.com",
    "resumeUrl": "https://example.com/resume.pdf", // Note: This might be managed via /api/resume now
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: Token missing or invalid.
  - `403 Forbidden`: User is not an admin.
  - `404 Not Found`: Profile not found.
    ```json
    { "message": "Profile not found. Please create one." }
    ```
  - `500 Internal Server Error`: Server-side error.

### 2.2 Update Profile

- **Endpoint:** `PUT /api/profile`
- **Description:** Updates the admin's profile information.
- **Authentication:** Protected (Admin access required).
- **Request Body:**
  - All fields are optional. Based on `updateProfileSchema`.
  - `biography` (string, optional)
  - `skills` (array of objects, optional):
    - `category` (string, required if skill object provided)
    - `items` (array of strings, required if skill object provided, min 1 item)
  - `education` (array of objects, optional):
    - `institution` (string, required if education object provided)
    - `degree` (string, required if education object provided)
    - `fieldOfStudy` (string, optional)
    - `startDate` (string, optional)
    - `endDate` (string, optional)
    - `description` (string, optional)
  - `workExperience` (array of objects, optional):
    - `company` (string, required if workExperience object provided)
    - `position` (string, required if workExperience object provided)
    - `startDate` (string, optional)
    - `endDate` (string, optional)
    - `description` (string, optional)
    - `responsibilities` (array of strings, optional)
  - `profilePictureUrl` (string, optional, valid URL or empty string)
  - `socialLinks` (array of objects, optional):
    - `platform` (string, required if socialLink object provided)
    - `url` (string, required if socialLink object provided, valid URL)
  - `contactEmail` (string, optional, valid email)
  ```json
  {
    "biography": "Updated biography.",
    "skills": [{ "category": "Backend", "items": ["Node.js", "Express"] }]
  }
  ```
- **Success Response (200 OK):**
  - Returns the updated profile object.
- **Error Responses:**
  - `400 Bad Request`: Validation error (e.g., invalid URL, missing required fields within sub-objects).
    ```json
    // Zod validation error example
    {
      "message": "Validation failed",
      "errors": [
        {
          "path": ["body", "profilePictureUrl"],
          "message": "Invalid URL for profile picture"
        }
      ]
    }
    ```
  - `401 Unauthorized`: Token missing or invalid.
  - `403 Forbidden`: User is not an admin.
  - `500 Internal Server Error`: Server-side error.

---

## 3. Projects

### Public Routes

#### 3.1 Get All Published Projects

- **Endpoint:** `GET /api/projects`
- **Description:** Retrieves all published projects with pagination and optional filtering.
- **Authentication:** Public.
- **Query Parameters:**
  - `category` (string, optional): Filter by technology/category (case-insensitive regex match on `technologies` array).
  - `page` (number, optional, default: 1): Page number for pagination.
  - `limit` (number, optional, default: 10): Number of items per page.
- **Success Response (200 OK):**
  ```json
  {
    "data": [
      {
        "_id": "60c72b2f9b1e8a001c8e4d90",
        "title": "Project Alpha",
        "slug": "project-alpha",
        "shortSummary": "A brief summary of Project Alpha.",
        "description": "<p>Detailed description...</p>",
        "technologies": ["React", "Node.js"],
        "role": "Full-stack Developer",
        "challenges": "Integrating X and Y.",
        "liveDemoUrl": "https://project-alpha.example.com",
        "sourceCodeUrl": "https://github.com/user/project-alpha",
        "images": [
          {
            "url": "https://example.com/image1.jpg",
            "altText": "Screenshot 1",
            "isThumbnail": true
          }
        ],
        "status": "published",
        "order": 1,
        "featured": true,
        "createdAt": "2023-01-10T00:00:00.000Z",
        "updatedAt": "2023-01-11T00:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
  ```
- **Error Responses:**
  - `500 Internal Server Error`: Server-side error.

#### 3.2 Get Single Published Project by ID or Slug

- **Endpoint:** `GET /api/projects/:idOrSlug`
- **Description:** Retrieves a single published project by its MongoDB ID or unique slug.
- **Authentication:** Public.
- **Path Parameters:**
  - `idOrSlug` (string, required): The ID or slug of the project.
- **Success Response (200 OK):**
  - Returns the project object (same structure as in "Get All Published Projects").
- **Error Responses:**
  - `404 Not Found`: Project not found or not published.
    ```json
    { "message": "Project not found or not published" }
    ```
  - `500 Internal Server Error`: Server-side error.

### Admin Routes

#### 3.3 Create New Project

- **Endpoint:** `POST /api/projects`
- **Description:** Creates a new project.
- **Authentication:** Protected (Admin access required).
- **Request Body:** Based on `createProjectSchema`.
  - `title` (string, required, min 1 char)
  - `shortSummary` (string, required, min 1 char)
  - `description` (string, required, min 1 char)
  - `technologies` (array of strings, required, min 1 item)
  - `role` (string, required, min 1 char)
  - `challenges` (string, required, min 1 char)
  - `liveDemoUrl` (string, optional, valid URL or empty string)
  - `sourceCodeUrl` (string, optional, valid URL or empty string)
  - `images` (array of objects, required, min 1 item):
    - `url` (string, required, valid URL)
    - `altText` (string, required, min 1 char)
    - `isThumbnail` (boolean, optional)
  - `status` (enum: "published" | "draft", required)
  - `order` (number, optional, positive integer)
  - `featured` (boolean, optional)
  - `slug` (string, optional): Auto-generated from title if not provided.
  ```json
  {
    "title": "New Awesome Project",
    "shortSummary": "Summary of this awesome project.",
    "description": "Full details about the project.",
    "technologies": ["TypeScript", "Next.js"],
    "role": "Lead Developer",
    "challenges": "Performance optimization.",
    "images": [
      { "url": "https://example.com/new.jpg", "altText": "New Project Image" }
    ],
    "status": "draft"
  }
  ```
- **Success Response (201 Created):**
  - Returns the created project object.
- **Error Responses:**
  - `400 Bad Request`: Validation error (e.g., missing fields, invalid URL).
    ```json
    // Zod validation error example
    {
      "message": "Validation failed",
      "errors": [{ "path": ["body", "title"], "message": "Title is required" }]
    }
    ```
    ```json
    // Mongoose validation or duplicate key error
    { "message": "Validation Error", "errors": { ... } }
    { "message": "Duplicate value error.", "errors": { "slug": "project-slug-already-exists" } }
    ```
  - `401 Unauthorized`: Token missing or invalid.
  - `403 Forbidden`: User is not an admin.
  - `500 Internal Server Error`: Server-side error.

#### 3.4 Get All Projects (Admin)

- **Endpoint:** `GET /api/admin/projects`
- **Description:** Retrieves all projects (published and drafts) for admin users, with pagination and sorting.
- **Authentication:** Protected (Admin access required).
- **Query Parameters:**
  - `status` (string, optional): Filter by status (e.g., "published", "draft").
  - `page` (number, optional, default: 1): Page number.
  - `limit` (number, optional, default: 10): Items per page.
  - `sortBy` (string, optional, default: "createdAt"): Field to sort by (e.g., "title", "status", "order", "createdAt").
  - `sortOrder` (string, optional, default: "desc"): Sort order ("asc" or "desc").
- **Success Response (200 OK):**
  - Similar structure to public `GET /api/projects` but includes all statuses.
- **Error Responses:**
  - `401 Unauthorized`.
  - `403 Forbidden`.
  - `500 Internal Server Error`.

#### 3.5 Get Single Project by ID (Admin)

- **Endpoint:** `GET /api/admin/projects/:id`
- **Description:** Retrieves a single project by ID, regardless of status (for admin).
- **Authentication:** Protected (Admin access required).
- **Path Parameters:**
  - `id` (string, required): The MongoDB ID of the project.
- **Success Response (200 OK):**
  - Returns the project object.
- **Error Responses:**
  - `401 Unauthorized`.
  - `403 Forbidden`.
  - `404 Not Found`: Project with the given ID not found.
  - `500 Internal Server Error`.

#### 3.6 Update Project (Admin)

- **Endpoint:** `PUT /api/admin/projects/:id`
- **Description:** Updates an existing project.
- **Authentication:** Protected (Admin access required).
- **Path Parameters:**
  - `id` (string, required): The MongoDB ID of the project to update.
- **Request Body:** Based on `updateProjectSchema` (all fields from `createProjectSchema` are optional).
  ```json
  {
    "title": "Updated Project Title",
    "status": "published"
  }
  ```
- **Success Response (200 OK):**
  - Returns the updated project object.
- **Error Responses:**
  - `400 Bad Request`: Validation error.
    ```json
    // Zod validation error example
    {
      "message": "Validation failed",
      "errors": [
        {
          "path": ["body", "liveDemoUrl"],
          "message": "Invalid URL format for live demo"
        }
      ]
    }
    ```
  - `401 Unauthorized`.
  - `403 Forbidden`.
  - `404 Not Found`: Project not found.
  - `500 Internal Server Error`.

#### 3.7 Delete Project (Admin)

- **Endpoint:** `DELETE /api/admin/projects/:id`
- **Description:** Deletes a project.
- **Authentication:** Protected (Admin access required).
- **Path Parameters:**
  - `id` (string, required): The MongoDB ID of the project to delete.
- **Success Response (200 OK):**
  ```json
  { "message": "Project removed" }
  ```
- **Error Responses:**
  - `401 Unauthorized`.
  - `403 Forbidden`.
  - `404 Not Found`: Project not found.
  - `500 Internal Server Error`.

---

## 4. Blog Posts

### Public Routes

#### 4.1 Get All Published Blog Posts

- **Endpoint:** `GET /api/blog`
- **Description:** Retrieves all published blog posts with pagination, tag filtering, and search.
- **Authentication:** Public.
- **Query Parameters:**
  - `page` (number, optional, default: 1): Page number.
  - `limit` (number, optional, default: 10): Items per page.
  - `tag` (string, optional): Filter by tag (case-insensitive).
  - `search` (string, optional): Search term for title, content, and tags (case-insensitive).
- **Success Response (200 OK):**
  ```json
  {
    "data": [
      {
        "_id": "60c72b2f9b1e8a001c8e4da0",
        "title": "My First Blog Post",
        "slug": "my-first-blog-post",
        "content": "This is the content of my first blog post...",
        "author": {
          "_id": "user_id",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "categories": ["Technology", "Web Development"],
        "tags": ["intro", "blogging"],
        "status": "published",
        "featuredImageUrl": "https://example.com/blog-image.jpg",
        "seoMetadata": {
          "seoTitle": "First Post",
          "seoDescription": "About my first post."
        },
        "publishedAt": "2023-02-01T10:00:00.000Z",
        "createdAt": "2023-02-01T09:00:00.000Z",
        "updatedAt": "2023-02-01T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "currentPage": 1
  }
  ```
- **Error Responses:**
  - `500 Internal Server Error`.

#### 4.2 Get Single Published Blog Post by Slug

- **Endpoint:** `GET /api/blog/:slug`
- **Description:** Retrieves a single published blog post by its slug.
- **Authentication:** Public.
- **Path Parameters:**
  - `slug` (string, required): The slug of the blog post.
- **Success Response (200 OK):**
  - Returns the blog post object (same structure as in "Get All Published Blog Posts").
- **Error Responses:**
  - `404 Not Found`: Blog post not found or not published.
    ```json
    { "message": "Blog post not found or not published" }
    ```
  - `500 Internal Server Error`.

#### 4.3 Get Unique Blog Post Tags

- **Endpoint:** `GET /api/blog/tags`
- **Description:** Retrieves a list of all unique tags from published blog posts.
- **Authentication:** Public.
- **Success Response (200 OK):**
  ```json
  {
    "tags": ["typescript", "nodejs", "react", "webdev"]
  }
  ```
- **Error Responses:**
  - `500 Internal Server Error`.

#### 4.4 Get Unique Blog Post Categories

- **Endpoint:** `GET /api/blog/categories`
- **Description:** Retrieves a list of all unique categories from published blog posts.
- **Authentication:** Public.
- **Success Response (200 OK):**
  ```json
  {
    "categories": ["Tutorials", "Case Studies", "News"]
  }
  ```
- **Error Responses:**
  - `500 Internal Server Error`.

### Admin Routes

#### 4.5 Create New Blog Post

- **Endpoint:** `POST /api/admin/blog` (Note: `blogPostRoutes.ts` also has `POST /api/blog` with `protect` middleware. This assumes `/api/admin/blog` is the primary admin creation route as per `adminBlogPostRoutes.ts`)
- **Description:** Creates a new blog post.
- **Authentication:** Protected (Admin access required).
- **Request Body:** Based on `createBlogPostSchema.body`.
  - `title` (string, required, min 1 char)
  - `content` (string, required, min 1 char)
  - `featuredImageUrl` (string, optional, valid URL or empty string)
  - `categories` (array of strings, required, min 1 item)
  - `tags` (array of strings, optional)
  - `status` (enum: "published" | "draft", required)
  - `slug` (string, required, min 1 char, valid slug format e.g., `my-new-post`)
  - `metaTitle` (string, optional)
  - `metaDescription` (string, optional)
  - (Note: `author` is set automatically from `req.user.id`)
  ```json
  {
    "title": "My New Admin Post",
    "content": "Content here.",
    "categories": ["Admin"],
    "tags": ["management"],
    "status": "draft",
    "slug": "my-new-admin-post"
  }
  ```
- **Success Response (201 Created):**
  - Returns the created blog post object.
- **Error Responses:**
  - `400 Bad Request`: Validation error.
    ```json
    // Zod validation error example
    {
      "message": "Validation failed",
      "errors": [{ "path": ["body", "title"], "message": "Title is required" }]
    }
    ```
  - `401 Unauthorized`.
  - `403 Forbidden`.
  - `409 Conflict`: Duplicate slug/title (if applicable).
  - `500 Internal Server Error`.

#### 4.6 Get All Blog Posts (Admin)

- **Endpoint:** `GET /api/admin/blog/all`
- **Description:** Retrieves all blog posts (published and drafts) for admin, with pagination, filtering, and sorting.
- **Authentication:** Protected (Admin access required).
- **Query Parameters:**
  - `page` (number, optional, default: 1)
  - `limit` (number, optional, default: 10)
  - `status` (string, optional): "published" or "draft".
  - `sortBy` (string, optional, default: "createdAt"): Field to sort by.
  - `sortOrder` (string, optional, default: "desc"): "asc" or "desc".
  - `search` (string, optional): Search term.
- **Success Response (200 OK):**
  - Similar structure to public `GET /api/blog` but includes all statuses and potentially more fields.
- **Error Responses:**
  - `401 Unauthorized`.
  - `403 Forbidden`.
  - `500 Internal Server Error`.

#### 4.7 Get Single Blog Post by ID (Admin)

- **Endpoint:** `GET /api/admin/blog/:id`
- **Description:** Retrieves a single blog post by ID, regardless of status (for admin).
- **Authentication:** Protected (Admin access required).
- **Path Parameters:**
  - `id` (string, required): The MongoDB ID of the blog post.
- **Success Response (200 OK):**
  - Returns the blog post object.
- **Error Responses:**
  - `401 Unauthorized`.
  - `403 Forbidden`.
  - `404 Not Found`: Blog post not found.
  - `500 Internal Server Error`.

#### 4.8 Update Blog Post (Admin)

- **Endpoint:** `PUT /api/admin/blog/:id`
- **Description:** Updates an existing blog post.
- **Authentication:** Protected (Admin access required).
- **Path Parameters:**
  - `id` (string, required): The MongoDB ID of the blog post.
- **Request Body:** Based on `updateBlogPostSchema` (all fields from `createBlogPostSchema.body` are optional).
  ```json
  {
    "title": "Updated Blog Post Title",
    "status": "published"
  }
  ```
- **Success Response (200 OK):**
  - Returns the updated blog post object.
- **Error Responses:**
  - `400 Bad Request`: Validation error.
  - `401 Unauthorized`.
  - `403 Forbidden`.
  - `404 Not Found`.
  - `500 Internal Server Error`.

#### 4.9 Delete Blog Post (Admin)

- **Endpoint:** `DELETE /api/admin/blog/:id`
- **Description:** Deletes a blog post.
- **Authentication:** Protected (Admin access required).
- **Path Parameters:**
  - `id` (string, required): The MongoDB ID of the blog post.
- **Success Response (200 OK):**
  ```json
  { "message": "Blog post deleted successfully" }
  ```
- **Error Responses:**
  - `401 Unauthorized`.
  - `403 Forbidden`.
  - `404 Not Found`.
  - `500 Internal Server Error`.

---

## 5. Resume

### 5.1 Update/Set Resume URL

- **Endpoint:** `POST /api/resume`
- **Description:** Updates or sets the URL for the admin's resume. This is stored in `SiteSetting`.
- **Authentication:** Protected (Admin access required).
- **Request Body:** Based on `updateResumeUrlSchema.body`.
  - `resumeUrl` (string, required, valid URL, min 1 char): The URL to the resume PDF.
  ```json
  {
    "resumeUrl": "https://example.com/new_resume.pdf"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "message": "Resume URL updated successfully",
    "resumeUrl": "https://example.com/new_resume.pdf"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Validation error (e.g., invalid URL, missing field).
    ```json
    // Zod validation error example
    {
      "message": "Validation failed",
      "errors": [
        {
          "path": ["body", "resumeUrl"],
          "message": "Invalid URL format for resume"
        }
      ]
    }
    ```
  - `401 Unauthorized`.
  - `403 Forbidden`.
  - `500 Internal Server Error`.

### 5.2 Get Resume URL

- **Endpoint:** `GET /api/resume/url`
- **Description:** Retrieves the publicly accessible resume URL.
- **Authentication:** Public.
- **Request Body:** None.
- **Success Response (200 OK):**
  ```json
  {
    "resumeUrl": "https://example.com/path/to/resume.pdf"
  }
  ```
- **Error Responses:**
  - `404 Not Found`: Resume URL not set.
    ```json
    { "message": "Resume URL not found" }
    ```
  - `500 Internal Server Error`.

---

## 6. Contact

### Public Route

#### 6.1 Submit Contact Form

- **Endpoint:** `POST /api/contact`
- **Description:** Submits a contact form message from a user.
- **Authentication:** Public.
- **Rate Limiting:** Applied (stricter limit).
- **Request Body:** Based on `contactFormSchema.body`.
  - `name` (string, required, min 1 char)
  - `email` (string, required, valid email format)
  - `subject` (string, optional)
  - `message` (string, required, min 1 char)
  - `captchaToken` (string, optional): For CAPTCHA validation if implemented.
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "subject": "Inquiry about services",
    "message": "Hello, I would like to know more..."
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "message": "Contact form submitted successfully. We will get back to you soon.",
    "submission": {
      "_id": "60c72b2f9b1e8a001c8e4db0",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "subject": "Inquiry about services",
      "message": "Hello, I would like to know more...",
      "isRead": false,
      "createdAt": "2023-03-01T12:00:00.000Z",
      "updatedAt": "2023-03-01T12:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Validation error (e.g., missing fields, invalid email).
    ```json
    // Zod validation error example
    {
      "message": "Validation failed",
      "errors": [
        { "path": ["body", "email"], "message": "Invalid email format" }
      ]
    }
    ```
  - `429 Too Many Requests`: Rate limit exceeded.
  - `500 Internal Server Error`: Email sending failure or other server error.

### Admin Routes

#### 6.2 Get Contact Submissions

- **Endpoint:** `GET /api/admin/contact-submissions`
- **Description:** Retrieves all contact form submissions for admin.
- **Authentication:** Protected (Admin access required).
- **Query Parameters:**
  - `page` (number, optional, default: 1)
  - `limit` (number, optional, default: 10)
  - `isRead` (boolean, optional): Filter by read status.
  - `sortBy` (string, optional, default: "createdAt")
  - `sortOrder` (string, optional, default: "desc")
- **Success Response (200 OK):**
  ```json
  {
    "data": [
      {
        "_id": "60c72b2f9b1e8a001c8e4db0",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "subject": "Inquiry",
        "message": "...",
        "isRead": false,
        "createdAt": "2023-03-01T12:00:00.000Z",
        "updatedAt": "2023-03-01T12:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`.
  - `403 Forbidden`.
  - `500 Internal Server Error`.

#### 6.3 Update Submission Status (Mark as Read/Unread)

- **Endpoint:** `PATCH /api/admin/contact-submissions/:id/status`
- **Description:** Updates the status of a contact submission (e.g., mark as read).
- **Authentication:** Protected (Admin access required).
- **Path Parameters:**
  - `id` (string, required): The MongoDB ID of the submission.
- **Request Body:**
  - `isRead` (boolean, required): Set to `true` to mark as read, `false` to mark as unread.
  ```json
  {
    "isRead": true
  }
  ```
- **Success Response (200 OK):**
  - Returns the updated contact submission object.
- **Error Responses:**
  - `400 Bad Request`: Missing `isRead` field or invalid value.
  - `401 Unauthorized`.
  - `403 Forbidden`.
  - `404 Not Found`: Submission not found.
  - `500 Internal Server Error`.

#### 6.4 Delete Submission

- **Endpoint:** `DELETE /api/admin/contact-submissions/:id`
- **Description:** Deletes a contact form submission.
- **Authentication:** Protected (Admin access required).
- **Path Parameters:**
  - `id` (string, required): The MongoDB ID of the submission.
- **Success Response (200 OK):**
  ```json
  { "message": "Submission deleted successfully" }
  ```
- **Error Responses:**
  - `401 Unauthorized`.
  - `403 Forbidden`.
  - `404 Not Found`: Submission not found.
  - `500 Internal Server Error`.

---

## 7. Admin Dashboard

### 7.1 Get Dashboard Statistics

- **Endpoint:** `GET /api/admin/dashboard/stats`
- **Description:** Retrieves various statistics for the admin dashboard.
- **Authentication:** Protected (Admin access required).
- **Request Body:** None.
- **Success Response (200 OK):**
  ```json
  {
    "totalProjects": 15,
    "totalPublishedPosts": 25,
    "totalDraftPosts": 5,
    "totalContactSubmissions": 100
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`.
  - `403 Forbidden`.
  - `500 Internal Server Error`.

---
