# CMS Backend API

A modular Node.js + Express backend for a content-managed website. This project provides authentication, role-based access control, user management, media uploads, blog posts, pages, menus, site settings, categories, and contact form inquiry handling.

It is designed like a **headless CMS backend**: the API manages content and system data, while a separate frontend or admin panel can consume the endpoints.

**Live Website:** [https://corpsite-teal.vercel.app/](https://corpsite-teal.vercel.app/)  
> This is the current live deployment at the time of writing. It may be changed, moved, or unavailable in the future.

Developed by [M Ahmad Amin](https://github.com/AhmadAmin5)


## Overview

This backend is built around a versioned REST API (`/api/v1`) with MongoDB as the database and Mongoose as the ODM. It supports:

- JWT-based authentication with access and refresh tokens
- Invitation-based account activation flow
- Role-based authorization for admin/editor-style workflows
- Media upload to Cloudinary
- Page and post management with public and protected endpoints
- Dynamic menu management
- Site-wide settings storage
- Contact form inquiry submission and admin handling
- Soft delete for users

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JWT + bcrypt
- **File Uploads:** multer
- **Cloud Storage:** Cloudinary
- **Utilities:** cookie-parser, cors, dotenv, chalk, streamifier

## Getting Started

### Prerequisites
- Node.js with ES module support
- MongoDB database
- Cloudinary account for image uploads

### 1. Clone the repository
```bash
git clone https://github.com/AhmadAmin5/CorpSite-Backend
cd CorpSite-Backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Add environment variables
Create your `.env` file using the `.env.sample` file given.

### 4. Start the server
In order to run the project in development mode, run:

```bash
npm run dev
```

For starting in development, you may use:
```bash
npm start
```


## Main Features

### 1. Authentication and Session Flow
- Login with **username or email + password**
- Access token returned in the response body
- Refresh token stored in an **HTTP-only cookie**
- Refresh endpoint for issuing a new access token
- Logout support
- `me` endpoint for fetching the currently authenticated user
- Invitation-based account activation using a one-time activation token

### 2. Role-Based Access Control
The API supports the following roles:

- `admin`
- `manager`
- `editor`
- `viewer`

Permissions are grouped by capability, such as:

- user management
- media management
- content management
- system management
- inquiry management

### 3. User Management
- Check username availability
- Check email availability
- Invite users into the system
- Activate invited accounts later by setting a password
- Fetch paginated users with filters
- Update profile details and profile picture
- Block/unblock users
- Soft delete users while freeing up unique email/username values

### 4. Media Library
- Image-only uploads using `multer`
- Files are stored in memory first, then uploaded to **Cloudinary**
- Uploaded assets are tracked in MongoDB
- Paginated media listing
- Delete media from both Cloudinary and the database

### 5. Posts and Categories
- Create, update, delete, and list posts
- Public endpoints for published posts
- Category creation and management
- Post metadata support:
  - slug
  - excerpt
  - featured image
  - tags
  - SEO fields
  - publish status

### 6. Pages
- Support for hierarchical pages using a `parent` reference
- Auto-generated `fullPath` values for nested routes
- Page types:
  - `generic`
  - `hardcoded`
  - `functional`
- Public endpoints for published pages
- Admin endpoints for full page management
- Prevents deleting a page that still has child pages

### 7. Menus
- Create and manage menus by slug
- Supports custom links and linked resources
- Menu item resource types:
  - page
  - post
  - category
  - custom URL
- Supports **one level of nested children** for dropdown-style menus
- Public endpoint available for fetching a menu by slug

### 8. Settings Store
- Key-value style settings storage in MongoDB
- Grouping support for related settings
- Useful for:
  - site title
  - menu placement
  - branding
  - configuration values needed by the frontend

### 9. Contact Inquiries
- Public endpoint for submitting contact form messages
- Admin/manager endpoints for:
  - listing inquiries
  - filtering by status
  - searching by sender details
  - viewing a single inquiry
  - updating internal notes/status
  - deleting inquiries
- Inquiries are auto-marked as `read` when opened for the first time



## Project Structure

```text
backend/
├── app.js
├── index.js
├── config/
│   ├── ApiVersion.js
│   └── roles.js
├── controllers/
│   ├── auth.controller.js
│   ├── category.controller.js
│   ├── contact.controller.js
│   ├── media.controller.js
│   ├── menu.controller.js
│   ├── page.controller.js
│   ├── post.controller.js
│   ├── setting.controller.js
│   └── user.controller.js
├── db/
│   └── index.js
├── middlewares/
│   ├── auth.middleware.js
│   ├── multer.middleware.js
│   └── role.middleware.js
├── models/
│   ├── category.model.js
│   ├── contact.model.js
│   ├── media.model.js
│   ├── menu.model.js
│   ├── page.model.js
│   ├── post.model.js
│   ├── setting.model.js
│   └── user.model.js
├── routes/
│   ├── auth.routes.js
│   ├── category.routes.js
│   ├── contact.routes.js
│   ├── media.routes.js
│   ├── menu.routes.js
│   ├── page.routes.js
│   ├── post.routes.js
│   ├── setting.routes.js
│   └── user.routes.js
└── utils/
    ├── ApiError.js
    ├── ApiResponse.js
    ├── asyncHandler.js
    ├── cloudinary.js
    ├── errorHandler.js
    └── logger.js
```

## API Base URL

```text
/api/v1
```

## Route Overview

### Health
- `GET /api/v1/health` — Health check endpoint

### Auth
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`
- `PATCH /api/v1/auth/update`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/activate-account`

### Users
- `POST /api/v1/user/check-username`
- `POST /api/v1/user/check-email`
- `GET /api/v1/user/:id`
- `POST /api/v1/user/` — invite user
- `GET /api/v1/user/` — list users
- `PATCH /api/v1/user/:id`
- `DELETE /api/v1/user/:id`

### Media
- `GET /api/v1/media/`
- `POST /api/v1/media/`
- `DELETE /api/v1/media/:id`

### Posts
- `GET /api/v1/post/public`
- `GET /api/v1/post/public/:slug`
- `GET /api/v1/post/`
- `POST /api/v1/post/`
- `GET /api/v1/post/:id`
- `PATCH /api/v1/post/:id`
- `DELETE /api/v1/post/:id`

### Categories
- `GET /api/v1/category/`
- `POST /api/v1/category/`
- `PATCH /api/v1/category/:id`
- `DELETE /api/v1/category/:id`

### Pages
- `GET /api/v1/page/public`
- `GET /api/v1/page/public/:slug`
- `GET /api/v1/page/`
- `POST /api/v1/page/`
- `GET /api/v1/page/:id`
- `PATCH /api/v1/page/:id`
- `DELETE /api/v1/page/:id`

### Menus
- `GET /api/v1/menu/public/:slug`
- `GET /api/v1/menu/`
- `POST /api/v1/menu/`
- `PATCH /api/v1/menu/:id`
- `DELETE /api/v1/menu/:id`

### Settings
- `GET /api/v1/setting/`
- `POST /api/v1/setting/`

### Contact
- `POST /api/v1/contact/public`
- `GET /api/v1/contact/`
- `GET /api/v1/contact/:id`
- `PATCH /api/v1/contact/:id`
- `DELETE /api/v1/contact/:id`

## Authentication Details

### Access Token
Protected routes expect the access token in the `Authorization` header:

```http
Authorization: Bearer <access_token>
```

### Refresh Token
The refresh token is stored in a cookie named `refreshToken`.

Current cookie configuration:

- `httpOnly: true`
- `secure: true`
- `sameSite: none`

That setup is good for production deployments over HTTPS. For plain local HTTP testing in a browser, cookie settings may need adjustment.

## Environment Variables

Create a `.env` file in the project root.
Follow `.env.sample` file, or code given below:

```env
PORT=8000

MONGODB_URI=mongodb://127.0.0.1:27017
DB_NAME=your_database_name

CORS_ORIGIN=http://localhost:3000

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d

CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_BASE_FOLDER=your_project_folder

ENABLE_LOGS=true
COLOR_LOGS=true
LOG_LEVEL=INFO
```

### Logging Levels
Supported log levels in the current logger:

- `ERROR`
- `WARN`
- `SUCCESS`
- `INFO`
- `DEBUG`


## Example Response Shape

### Success Response
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Success",
  "success": true
}
```

### Error Response
```json
{
  "success": false,
  "message": "Something went wrong",
  "errors": []
}
```

## Important Implementation Notes

- Only **image files** are accepted by the upload middleware.
- Maximum upload size is **10 MB**.
- Uploaded files are first held in memory, then streamed to Cloudinary.
- Users are **soft deleted**, not hard deleted.
- Page `fullPath` values are generated automatically from parent-child relationships.
- Post and page slugs are normalized and used for public retrieval.
- Contact queries support statuses such as `unread`, `read`, `replied`, and `archived`.

## Why This Project Is Useful

This project is a strong backend foundation for:

- a corporate website CMS
- a blog + static pages platform
- an admin dashboard with role-based content management
- a custom headless CMS for React, Next.js, or any frontend client
