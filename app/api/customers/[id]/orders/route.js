import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Get orders for a logged-in user.
// `id` is the User.id (as used by the frontend profile page).
// Includes:
// - Orders linked to the user's Customer profile
// - Guest orders placed with the same phone number (customerPhone)
export async function GET(_request, { params }) {
  try {
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, phone: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { customer: { userId: user.id } },
          ...(user.phone ? [{ customerPhone: user.phone }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                name: true,
                price: true,
                images: { take: 1, select: { url: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("GET CUSTOMER ORDERS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

