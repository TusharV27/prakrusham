import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET - Fetch all contact messages (admin only)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const email = searchParams.get('email');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    const skip = (page - 1) * limit;

    // Build where conditions
    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }

    // Fetch contacts with pagination
    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.contact.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: contacts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

/**
 * POST - Submit a new contact form
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'All fields are required (name, email, subject, message)' 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create contact message
    const contact = await prisma.contact.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        status: 'NEW'
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Your message has been received. We will respond shortly.',
        data: contact
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update contact status (admin only)
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'ID and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['NEW', 'READ', 'REPLIED', 'ARCHIVED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Contact not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a contact message (admin only)
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    await prisma.contact.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Contact not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
