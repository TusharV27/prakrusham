# Contact Us Form API - Documentation

## Overview

A complete REST API for handling contact form submissions. Users can submit their inquiries through the contact form, and admins can manage, view, and respond to messages through the API.

## Database Model

### Contact Table

```prisma
model Contact {
  id        String   @id @default(cuid())
  name      String
  email     String
  subject   String
  message   String
  status    ContactStatus @default(NEW)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum ContactStatus {
  NEW
  READ
  REPLIED
  ARCHIVED
}
```

## Quick Start

### 1. Run Database Migration

```bash
npx prisma migrate dev --name add_contact_model
```

This creates:
- `Contact` table with appropriate fields
- `ContactStatus` enum
- Indexes for efficient querying

### 2. Verify API Endpoint

The API is ready at: `http://localhost:3000/api/contact`

## API Endpoints

### 1. Submit Contact Form (POST)

**Endpoint:** `POST /api/contact`

**Description:** Submit a new contact message

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Product Inquiry",
  "message": "I am interested in learning more about your services..."
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Your message has been received. We will respond shortly.",
  "data": {
    "id": "cm123abc456...",
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Product Inquiry",
    "message": "I am interested in learning more about your services...",
    "status": "NEW",
    "createdAt": "2026-04-17T12:30:00.000Z",
    "updatedAt": "2026-04-17T12:30:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "All fields are required (name, email, subject, message)"
}
```

**Validations:**
- All fields (name, email, subject, message) are required
- Email must be in valid format
- Empty/whitespace-only fields are trimmed

---

### 2. Get All Contacts (GET) - Admin

**Endpoint:** `GET /api/contact`

**Description:** Retrieve contact messages with optional filtering and pagination

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | "ALL" | Filter by status: NEW, READ, REPLIED, ARCHIVED, or ALL |
| `email` | string | - | Filter by email (partial match, case-insensitive) |
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Results per page |

**Examples:**
```
GET /api/contact
GET /api/contact?status=NEW
GET /api/contact?status=NEW&page=2&limit=20
GET /api/contact?email=john@example.com
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cm123abc456...",
      "name": "John Doe",
      "email": "john@example.com",
      "subject": "Product Inquiry",
      "message": "I am interested...",
      "status": "NEW",
      "createdAt": "2026-04-17T12:30:00.000Z",
      "updatedAt": "2026-04-17T12:30:00.000Z"
    },
    {
      "id": "cm789xyz...",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "subject": "Complaint",
      "message": "I received a damaged product...",
      "status": "READ",
      "createdAt": "2026-04-16T10:15:00.000Z",
      "updatedAt": "2026-04-17T11:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

### 3. Update Contact Status (PATCH) - Admin

**Endpoint:** `PATCH /api/contact`

**Description:** Change the status of a contact message

**Request Body:**
```json
{
  "id": "cm123abc456...",
  "status": "READ"
}
```

**Valid Status Values:**
- `NEW` - Message just received
- `READ` - Admin has read the message
- `REPLIED` - Admin has responded
- `ARCHIVED` - Message is archived

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Contact updated successfully",
  "data": {
    "id": "cm123abc456...",
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Product Inquiry",
    "message": "I am interested...",
    "status": "READ",
    "createdAt": "2026-04-17T12:30:00.000Z",
    "updatedAt": "2026-04-17T12:35:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid status. Must be one of: NEW, READ, REPLIED, ARCHIVED"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Contact not found"
}
```

---

### 4. Delete Contact (DELETE) - Admin

**Endpoint:** `DELETE /api/contact`

**Description:** Remove a contact message

**Query Parameter:**
```
?id=cm123abc456...
```

**Example:**
```
DELETE /api/contact?id=cm123abc456...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Contact deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Contact not found"
}
```

---

## Frontend Integration

### React Example

```jsx
"use client";

import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setFormData({ name: '', email: '', subject: '', message: '' });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to send message. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={handleChange}
        required
        className="w-full border rounded px-4 py-3"
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
        className="w-full border rounded px-4 py-3"
      />

      <input
        type="text"
        name="subject"
        placeholder="Subject"
        value={formData.subject}
        onChange={handleChange}
        required
        className="w-full border rounded px-4 py-3"
      />

      <textarea
        name="message"
        placeholder="Your Message"
        rows="5"
        value={formData.message}
        onChange={handleChange}
        required
        className="w-full border rounded px-4 py-3"
      />

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Message sent successfully!</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded font-semibold hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
```

## Testing with cURL

### Submit a message
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Subject",
    "message": "This is a test message"
  }'
```

### Get all NEW messages
```bash
curl http://localhost:3000/api/contact?status=NEW
```

### Mark message as READ
```bash
curl -X PATCH http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "id": "cm123abc456...",
    "status": "READ"
  }'
```

### Delete a message
```bash
curl -X DELETE http://localhost:3000/api/contact?id=cm123abc456...
```

## Database Schema

```sql
-- Contact table created by Prisma
CREATE TABLE "Contact" (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  subject VARCHAR(191) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(191) NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Contact_status_idx" ON "Contact"("status");
CREATE INDEX "Contact_email_idx" ON "Contact"("email");
```

## Features

✅ **Form Submission** - Accept contact form submissions from frontend  
✅ **Validation** - Server-side validation for all fields  
✅ **Pagination** - Efficient retrieval of large numbers of messages  
✅ **Status Tracking** - Track message status (NEW, READ, REPLIED, ARCHIVED)  
✅ **Filtering** - Filter by status, email, and other criteria  
✅ **Error Handling** - Comprehensive error responses  
✅ **Timestamps** - Automatic tracking of creation and update times  

## Security Considerations

- Add authentication/authorization middleware for admin endpoints (GET, PATCH, DELETE)
- Validate and sanitize all input on the backend
- Consider rate limiting to prevent spam
- Store sensitive data securely
- Use HTTPS in production
- Add CORS configuration if needed

## Files Modified/Created

- ✅ `prisma/schema.prisma` - Added Contact model and ContactStatus enum
- ✅ `app/api/contact/route.js` - Created API endpoint with all 4 HTTP methods
- ✅ Documentation files created

## Next Steps

1. Run the migration: `npx prisma migrate dev --name add_contact_model`
2. Start the development server: `npm run dev`
3. Test the API using the examples above
4. Update the frontend contact form to call the API
5. (Optional) Add authentication to admin endpoints
6. (Optional) Add email notifications for new messages

## Troubleshooting

**Migration failed?**
- Ensure DATABASE_URL is set correctly
- Check database connection
- Run `npx prisma db push` if migrations folder is corrupted

**API returning 500 error?**
- Check server logs for detailed error messages
- Verify Prisma Client is properly initialized
- Ensure database is running and accessible

**Validation errors?**
- Ensure all required fields are provided
- Email must be in valid format (user@domain.com)
- Check for empty/whitespace-only values

---

For more details, see `scratch/contact-api-guide.js` for code examples and test cases.
