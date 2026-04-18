import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// CREATE CUSTOMER
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId } = body ?? {};

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if customer already exists for this user
    const existingCustomer = await prisma.customer.findUnique({
      where: { userId },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer already exists for this user' },
        { status: 409 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        userId,
      },
      include: {
        user: true,
        addresses: true,
        orders: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Customer created successfully',
        customer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('CREATE CUSTOMER ERROR:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}

// GET ALL CUSTOMERS
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        user: true,
        addresses: true,
        orders: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      customers,
    });
  } catch (error) {
    console.error('GET CUSTOMERS ERROR:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}