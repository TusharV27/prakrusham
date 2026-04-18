/**
 * Contact Form API - Setup & Testing Guide
 * 
 * This file provides instructions and examples for using the newly created
 * Contact Form API endpoint.
 */

// ============================================================================
// SETUP INSTRUCTIONS
// ============================================================================

/**
 * Step 1: Run the Prisma Migration
 * 
 * In your terminal, run:
 *   npx prisma migrate dev --name add_contact_model
 * 
 * This will:
 * - Create the "Contact" table in your database
 * - Create the "ContactStatus" enum
 * - Update the Prisma Client
 * 
 * Step 2: (Optional) Seed with sample data
 * 
 * If you want to populate test data:
 *   npx prisma db seed
 * 
 * Step 3: Start your development server
 * 
 *   npm run dev
 * 
 * The API will be available at: http://localhost:3000/api/contact
 */

// ============================================================================
// API ENDPOINTS & EXAMPLES
// ============================================================================

/**
 * 1. POST /api/contact - Submit a new contact form
 * 
 * Description: Create a new contact message from the frontend form
 * 
 * Request Body:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "subject": "Product Inquiry",
 *   "message": "I am interested in your organic vegetables..."
 * }
 * 
 * Success Response (201 Created):
 * {
 *   "success": true,
 *   "message": "Your message has been received. We will respond shortly.",
 *   "data": {
 *     "id": "cuid123...",
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "subject": "Product Inquiry",
 *     "message": "I am interested in your organic vegetables...",
 *     "status": "NEW",
 *     "createdAt": "2026-04-17T12:00:00.000Z",
 *     "updatedAt": "2026-04-17T12:00:00.000Z"
 *   }
 * }
 * 
 * Error Response (400 Bad Request):
 * {
 *   "success": false,
 *   "error": "All fields are required (name, email, subject, message)"
 * }
 * 
 * Error Response (400 Bad Request):
 * {
 *   "success": false,
 *   "error": "Invalid email format"
 * }
 */

// Example using fetch (Frontend)
async function submitContactForm() {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Product Inquiry',
        message: 'I would like to know more about your organic vegetables.'
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Message sent successfully:', data);
      alert(data.message); // "Your message has been received..."
    } else {
      console.error('Error:', data.error);
      alert('Error sending message: ' + data.error);
    }
  } catch (error) {
    console.error('Request failed:', error);
    alert('Failed to send message. Please try again later.');
  }
}

/**
 * 2. GET /api/contact - Fetch all contact messages (Admin)
 * 
 * Description: Retrieve all contact submissions with optional filtering
 * 
 * Query Parameters:
 * - status: "NEW" | "READ" | "REPLIED" | "ARCHIVED" | "ALL" (default: ALL)
 * - email: Filter by email address (contains search)
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 10)
 * 
 * Example: GET /api/contact?status=NEW&page=1&limit=10
 * 
 * Success Response (200 OK):
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "cuid123...",
 *       "name": "John Doe",
 *       "email": "john@example.com",
 *       "subject": "Product Inquiry",
 *       "message": "I would like to know more...",
 *       "status": "NEW",
 *       "createdAt": "2026-04-17T12:00:00.000Z",
 *       "updatedAt": "2026-04-17T12:00:00.000Z"
 *     },
 *     // ... more results
 *   ],
 *   "pagination": {
 *     "total": 25,
 *     "page": 1,
 *     "limit": 10,
 *     "totalPages": 3
 *   }
 * }
 */

// Example using fetch (Admin)
async function fetchContactMessages() {
  try {
    const response = await fetch('/api/contact?status=NEW&page=1&limit=10');
    const data = await response.json();

    if (data.success) {
      console.log('Messages:', data.data);
      console.log('Total pages:', data.pagination.totalPages);
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

/**
 * 3. PATCH /api/contact - Update contact status (Admin)
 * 
 * Description: Change the status of a contact message
 * 
 * Request Body:
 * {
 *   "id": "cuid123...",
 *   "status": "READ" | "REPLIED" | "ARCHIVED"
 * }
 * 
 * Success Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Contact updated successfully",
 *   "data": {
 *     "id": "cuid123...",
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "subject": "Product Inquiry",
 *     "message": "I would like to know more...",
 *     "status": "READ",
 *     "createdAt": "2026-04-17T12:00:00.000Z",
 *     "updatedAt": "2026-04-17T12:00:10.000Z"
 *   }
 * }
 */

// Example using fetch (Admin)
async function markContactAsRead(contactId) {
  try {
    const response = await fetch('/api/contact', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: contactId,
        status: 'READ'
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('Message marked as read:', data.data);
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

/**
 * 4. DELETE /api/contact - Delete a contact message (Admin)
 * 
 * Description: Remove a contact message
 * 
 * Query Parameters:
 * - id: Contact ID to delete (required)
 * 
 * Example: DELETE /api/contact?id=cuid123...
 * 
 * Success Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Contact deleted successfully"
 * }
 * 
 * Error Response (404 Not Found):
 * {
 *   "success": false,
 *   "error": "Contact not found"
 * }
 */

// Example using fetch (Admin)
async function deleteContact(contactId) {
  try {
    const response = await fetch(`/api/contact?id=${contactId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.success) {
      console.log('Message deleted successfully');
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

// ============================================================================
// CONTACT STATUS ENUM VALUES
// ============================================================================

/**
 * Contact messages can have the following statuses:
 * 
 * - NEW: Just received, not yet read
 * - READ: Admin has read the message
 * - REPLIED: Admin has replied to the message
 * - ARCHIVED: Message has been archived
 * 
 * Default status when a message is submitted: NEW
 */

// ============================================================================
// INTEGRATION WITH CONTACT FORM (Frontend)
// ============================================================================

/**
 * Update your contact form page at app/(frontend)/contact/page.jsx
 * to call the API:
 * 
 * Add this to your form submission:
 * 
 * const handleSubmit = async (e) => {
 *   e.preventDefault();
 *   
 *   try {
 *     const response = await fetch('/api/contact', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({
 *         name: formData.name,
 *         email: formData.email,
 *         subject: formData.subject,
 *         message: formData.message
 *       })
 *     });
 *     
 *     const result = await response.json();
 *     
 *     if (result.success) {
 *       setFormData({ name: '', email: '', subject: '', message: '' });
 *       setSuccess(true);
 *       setTimeout(() => setSuccess(false), 3000);
 *     } else {
 *       setError(result.error);
 *     }
 *   } catch (error) {
 *     setError('Failed to send message. Please try again.');
 *   }
 * };
 */

// ============================================================================
// TESTING WITH CURL (Command Line)
// ============================================================================

/**
 * Test POST request (Create Contact):
 * 
 * curl -X POST http://localhost:3000/api/contact \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "name": "Test User",
 *     "email": "test@example.com",
 *     "subject": "Test Subject",
 *     "message": "This is a test message"
 *   }'
 * 
 * 
 * Test GET request (Fetch Contacts):
 * 
 * curl http://localhost:3000/api/contact?status=NEW&page=1
 * 
 * 
 * Test PATCH request (Update Status):
 * 
 * curl -X PATCH http://localhost:3000/api/contact \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "id": "<contact_id_here>",
 *     "status": "READ"
 *   }'
 * 
 * 
 * Test DELETE request:
 * 
 * curl -X DELETE http://localhost:3000/api/contact?id=<contact_id_here>
 */

export {}; // Make this a module
