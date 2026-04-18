import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request) {
  try {
    const { productId, isRecommendation } = await request.json();

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    // If isRecommendation is provided, use it. Otherwise toggle.
    let targetStatus = isRecommendation;
    if (targetStatus === undefined) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { isRecommendation: true }
      });
      targetStatus = !product.isRecommendation;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { isRecommendation: targetStatus }
    });

    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error("ADMIN_RECOMMENDATION_PUT_ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
