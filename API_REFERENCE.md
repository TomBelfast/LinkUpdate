# 📡 API Reference Documentation

Complete API endpoint reference for Link Manager application.

## Table of Contents

- [Authentication](#authentication)
- [Links](#links)
- [Prompts](#prompts)
- [Ideas](#ideas)
- [API Keys](#api-keys)
- [GitHub](#github)
- [Admin](#admin)
- [User](#user)
- [AI](#ai)
- [Upload & Media](#upload--media)

---

## Authentication

### POST `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name"
}
```

**Response:**
- `201 Created` - User created successfully
- `400 Bad Request` - Invalid input data
- `409 Conflict` - Email already exists

---

### POST `/api/auth/forgot-password`

Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
- `200 OK` - Reset email sent (always returns success for security)
- `400 Bad Request` - Invalid email format

---

### POST `/api/auth/reset-password`

Reset password using reset token.

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "newpassword"
}
```

**Response:**
- `200 OK` - Password reset successfully
- `400 Bad Request` - Invalid token or password
- `401 Unauthorized` - Token expired

---

### `/api/auth/[...nextauth]`

NextAuth.js authentication endpoints:
- `/api/auth/signin` - Sign in
- `/api/auth/signout` - Sign out
- `/api/auth/session` - Get current session
- `/api/auth/callback/google` - Google OAuth callback

**Authentication Methods:**
- Credentials (email/password)
- Google OAuth 2.0

---

## Links

### GET `/api/links`

Get all links for the authenticated user.

**Query Parameters:**
- None

**Response:**
```json
[
  {
    "id": 1,
    "url": "https://example.com",
    "title": "Example Link",
    "description": "Link description",
    "prompt": "Optional prompt text",
    "userId": "user-uuid",
    "imageData": "base64-encoded-image",
    "imageMimeType": "image/png",
    "thumbnailData": "base64-encoded-thumbnail",
    "thumbnailMimeType": "image/jpeg",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

**Authentication:** Required

---

### POST `/api/links`

Create a new link.

**Request Body:**
```json
{
  "url": "https://example.com",
  "title": "Example Link",
  "description": "Optional description",
  "prompt": "Optional prompt text",
  "imageData": "base64-encoded-image (optional)",
  "imageMimeType": "image/png (optional)",
  "thumbnailData": "base64-encoded-thumbnail (optional)",
  "thumbnailMimeType": "image/jpeg (optional)"
}
```

**Response:**
- `201 Created` - Link created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated

---

### GET `/api/links/[id]`

Get a specific link by ID.

**Path Parameters:**
- `id` (number) - Link ID

**Response:**
```json
{
  "id": 1,
  "url": "https://example.com",
  "title": "Example Link",
  "description": "Link description",
  "userId": "user-uuid",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Authentication:** Required (must own the link)

---

### PUT `/api/links/[id]`

Update an existing link.

**Path Parameters:**
- `id` (number) - Link ID

**Request Body:**
```json
{
  "url": "https://updated.com",
  "title": "Updated Title",
  "description": "Updated description",
  "prompt": "Updated prompt",
  "imageData": "base64-encoded-image (optional)",
  "imageMimeType": "image/png (optional)",
  "thumbnailData": "base64-encoded-thumbnail (optional)",
  "thumbnailMimeType": "image/jpeg (optional)"
}
```

**Response:**
- `200 OK` - Link updated
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized to edit this link
- `404 Not Found` - Link not found

---

### DELETE `/api/links/[id]`

Delete a link.

**Path Parameters:**
- `id` (number) - Link ID

**Response:**
- `200 OK` - Link deleted
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized to delete this link
- `404 Not Found` - Link not found

---

### GET `/api/links/[id]/thumbnail`

Get link thumbnail image.

**Path Parameters:**
- `id` (number) - Link ID

**Response:**
- `200 OK` - Image data (binary)
- `404 Not Found` - Thumbnail not available

**Headers:**
- `Content-Type: image/jpeg` or `image/png`

---

## Prompts

### GET `/api/prompts`

Get all prompts for the authenticated user.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Prompt Title",
    "content": "Prompt content",
    "userId": "user-uuid",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

**Authentication:** Required

---

### POST `/api/prompts`

Create a new prompt.

**Request Body:**
```json
{
  "title": "Prompt Title",
  "content": "Prompt content text"
}
```

**Response:**
- `201 Created` - Prompt created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated

---

### GET `/api/prompts/[id]`

Get a specific prompt by ID.

**Path Parameters:**
- `id` (number) - Prompt ID

**Response:**
```json
{
  "id": 1,
  "title": "Prompt Title",
  "content": "Prompt content",
  "userId": "user-uuid",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Authentication:** Required (must own the prompt)

---

### PUT `/api/prompts/[id]`

Update an existing prompt.

**Path Parameters:**
- `id` (number) - Prompt ID

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content"
}
```

**Response:**
- `200 OK` - Prompt updated
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized
- `404 Not Found` - Prompt not found

---

### DELETE `/api/prompts/[id]`

Delete a prompt.

**Path Parameters:**
- `id` (number) - Prompt ID

**Response:**
- `200 OK` - Prompt deleted
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized
- `404 Not Found` - Prompt not found

---

## Ideas

### GET `/api/ideas`

Get all ideas for the authenticated user.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Idea Title",
    "description": "Idea description",
    "status": "pending",
    "userId": "user-uuid",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

**Authentication:** Required

---

### POST `/api/ideas`

Create a new idea.

**Request Body:**
```json
{
  "title": "Idea Title",
  "description": "Idea description",
  "status": "pending"
}
```

**Response:**
- `201 Created` - Idea created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated

---

### PUT `/api/ideas/[id]`

Update an existing idea.

**Path Parameters:**
- `id` (number) - Idea ID

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "in-progress"
}
```

**Response:**
- `200 OK` - Idea updated
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized
- `404 Not Found` - Idea not found

---

### DELETE `/api/ideas/[id]`

Delete an idea.

**Path Parameters:**
- `id` (number) - Idea ID

**Response:**
- `200 OK` - Idea deleted
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized
- `404 Not Found` - Idea not found

---

## API Keys

### GET `/api/api-keys`

Get all API keys for the authenticated user.

**Response:**
```json
[
  {
    "id": 1,
    "serviceName": "OpenAI",
    "apiName": "GPT-4",
    "websiteUrl": "https://openai.com",
    "apiKey": "sk-...",
    "description": "API key description",
    "userId": "user-uuid",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

**Authentication:** Required

---

### POST `/api/api-keys`

Create a new API key.

**Request Body:**
```json
{
  "service_name": "OpenAI",
  "api_name": "GPT-4",
  "website_url": "https://openai.com",
  "api_key": "sk-...",
  "description": "Optional description"
}
```

**Response:**
- `201 Created` - API key created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated

---

### GET `/api/api-keys/categories`

Get API key categories.

**Response:**
```json
[
  {
    "id": 1,
    "name": "AI Services",
    "description": "AI provider APIs"
  }
]
```

**Authentication:** Required

---

### PUT `/api/api-keys/[id]`

Update an existing API key.

**Path Parameters:**
- `id` (number) - API key ID

**Request Body:**
```json
{
  "service_name": "OpenAI",
  "api_name": "GPT-4",
  "website_url": "https://openai.com",
  "api_key": "sk-...",
  "description": "Updated description"
}
```

**Response:**
- `200 OK` - API key updated
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized
- `404 Not Found` - API key not found

---

### DELETE `/api/api-keys/[id]`

Delete an API key.

**Path Parameters:**
- `id` (number) - API key ID

**Response:**
- `200 OK` - API key deleted
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized
- `404 Not Found` - API key not found

---

## GitHub

### GET `/api/github/repositories`

Get all GitHub repositories for the authenticated user.

**Response:**
```json
[
  {
    "id": 1,
    "name": "repository-name",
    "fullName": "owner/repository-name",
    "description": "Repository description",
    "url": "https://github.com/owner/repository-name",
    "userId": "user-uuid",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

**Authentication:** Required

---

### POST `/api/github/repositories`

Add a new GitHub repository.

**Request Body:**
```json
{
  "name": "repository-name",
  "fullName": "owner/repository-name",
  "description": "Repository description",
  "url": "https://github.com/owner/repository-name"
}
```

**Response:**
- `201 Created` - Repository added
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated

---

### GET `/api/github/repositories/[id]`

Get a specific repository by ID.

**Path Parameters:**
- `id` (number) - Repository ID

**Response:**
```json
{
  "id": 1,
  "name": "repository-name",
  "fullName": "owner/repository-name",
  "description": "Repository description",
  "url": "https://github.com/owner/repository-name",
  "userId": "user-uuid",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Authentication:** Required

---

### POST `/api/github/repositories/[id]/generate-description`

Generate AI-powered description for a repository.

**Path Parameters:**
- `id` (number) - Repository ID

**Response:**
```json
{
  "description": "AI-generated repository description"
}
```

**Authentication:** Required

---

### PUT `/api/github/repositories/[id]`

Update a repository.

**Path Parameters:**
- `id` (number) - Repository ID

**Request Body:**
```json
{
  "name": "updated-name",
  "fullName": "owner/updated-name",
  "description": "Updated description",
  "url": "https://github.com/owner/updated-name"
}
```

**Response:**
- `200 OK` - Repository updated
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized
- `404 Not Found` - Repository not found

---

### DELETE `/api/github/repositories/[id]`

Delete a repository.

**Path Parameters:**
- `id` (number) - Repository ID

**Response:**
- `200 OK` - Repository deleted
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized
- `404 Not Found` - Repository not found

---

## Admin

### GET `/api/admin/users`

Get all users (admin only).

**Response:**
```json
[
  {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

**Authentication:** Required (admin role)

---

### PUT `/api/admin/update-user-role`

Update user role (admin only).

**Request Body:**
```json
{
  "userId": "user-uuid",
  "role": "admin"
}
```

**Response:**
- `200 OK` - Role updated
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not admin

---

## User

### PUT `/api/user/update-profile`

Update user profile.

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

**Response:**
- `200 OK` - Profile updated
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `409 Conflict` - Email already exists

---

## AI

### POST `/api/ai/generate`

Generate AI content.

**Request Body:**
```json
{
  "prompt": "Generate content about...",
  "provider": "openai",
  "model": "gpt-4"
}
```

**Response:**
```json
{
  "content": "Generated AI content",
  "tokens": 150,
  "model": "gpt-4"
}
```

**Authentication:** Required

**Rate Limiting:** Applied

---

### POST `/api/ai/estimate`

Estimate token/cost for AI generation.

**Request Body:**
```json
{
  "prompt": "Text to estimate",
  "provider": "openai",
  "model": "gpt-4"
}
```

**Response:**
```json
{
  "estimatedTokens": 150,
  "estimatedCost": 0.003
}
```

**Authentication:** Required

---

### GET `/api/ai/provider-test/perplexity`

Test Perplexity AI provider connection.

**Response:**
```json
{
  "status": "connected",
  "model": "sonar"
}
```

**Authentication:** Required

---

## Upload & Media

### POST `/api/upload`

Upload an image file.

**Request:** `multipart/form-data`
- `file` - Image file (required)

**Response:**
```json
{
  "id": "file-id",
  "url": "/api/images/file-id",
  "mimeType": "image/png",
  "size": 12345
}
```

**Authentication:** Required

**File Restrictions:**
- Max size: 10MB
- Allowed types: image/png, image/jpeg, image/gif, image/webp

---

### GET `/api/images/[id]`

Get image by ID.

**Path Parameters:**
- `id` (string) - Image ID

**Response:**
- `200 OK` - Image data (binary)
- `404 Not Found` - Image not found

**Headers:**
- `Content-Type: image/png` or `image/jpeg`

---

### GET `/api/media/[id]`

Get media file by ID.

**Path Parameters:**
- `id` (string) - Media ID

**Response:**
- `200 OK` - Media data (binary)
- `404 Not Found` - Media not found

---

### GET `/api/media/[id]/thumbnail`

Get media thumbnail.

**Path Parameters:**
- `id` (string) - Media ID

**Response:**
- `200 OK` - Thumbnail image (binary)
- `404 Not Found` - Thumbnail not available

---

## Health Check

### GET `/api/health`

Check API health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Authentication:** Not required

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid input data",
  "status": 400
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "status": 401
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden - insufficient permissions",
  "status": 403
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "status": 404
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "status": 500
}
```

---

## Authentication

Most endpoints require authentication via NextAuth.js session cookies. Include credentials in requests:

**Browser:**
- Cookies are automatically included

**cURL/HTTP Client:**
```bash
# Get session cookie first via login
curl -X POST http://localhost:9999/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  -c cookies.txt

# Use cookie in subsequent requests
curl -X GET http://localhost:9999/api/links \
  -b cookies.txt
```

---

## Rate Limiting

Some endpoints have rate limiting applied:
- `/api/ai/generate` - Rate limited to prevent abuse
- `/api/auth/register` - Rate limited to prevent spam

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

---

*Last updated: 2024-12-29*

