import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET SINGLE CUSTOMER
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        user: true,
        addresses: true,
        orders: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error('GET CUSTOMER ERROR:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}

// UPDATE CUSTOMER
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId } = body ?? {};

    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // If updating userId, check for duplicate
    if (userId && userId !== existingCustomer.userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) {
        return NextResponse.json(
          { error: 'New user not found' },
          { status: 404 }
        );
      }

      const duplicateCustomer = await prisma.customer.findUnique({
        where: { userId },
      });

      if (duplicateCustomer) {
        return NextResponse.json(
          { error: 'Another customer already exists for this user' },
          { status: 409 }
        );
      }
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        ...(userId && { userId }),
      },
      include: {
        user: true,
        addresses: true,
        orders: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Customer updated successfully',
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error('UPDATE CUSTOMER ERROR:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}

// DELETE CUSTOMER
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    console.error('DELETE CUSTOMER ERROR:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}