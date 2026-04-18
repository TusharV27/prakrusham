import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const farmerId = searchParams.get('farmerId');
    const vendorId = searchParams.get('vendorId');

    const reviews = await prisma.review.findMany({
      where: {
        status: { in: ['APPROVED', 'PENDING'] },
        OR: [
          { productId: productId || undefined },
          { farmerId: farmerId || undefined },
          { vendorId: vendorId || undefined }
        ].filter(condition => Object.values(condition)[0] !== undefined)
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      authorId, 
      rating, 
      comment, 
      productId, 
      farmerId, 
      vendorId 
    } = body;

    if (!authorId || !rating) {
      return NextResponse.json(
        { success: false, error: 'authorId and rating are required' },
        { status: 400 }
      );
    }

    // At least one of productId, farmerId, or vendorId should be provided
    if (!productId && !farmerId && !vendorId) {
      return NextResponse.json(
        { success: false, error: 'At least one of productId, farmerId, or vendorId is required' },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        authorId,
        rating: parseInt(rating),
        comment: comment ? { en: comment } : null,   // adjust for your Json structure
        productId: productId || null,
        farmerId: farmerId || null,
        vendorId: vendorId || null,
        status: 'PENDING',   // default
      },
      include: {
        author: true,
        product: true,
        farmer: { include: { user: true } },
        vendor: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}