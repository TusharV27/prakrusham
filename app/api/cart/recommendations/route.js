import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cartItemRefs = (searchParams.get("cartItemIds")?.split(",") || []).filter(id => id.trim() !== "");

    // cartItemIds may contain Product ids or slugs (client cart can use stable slugs across restores)
    let excludedProductIds = [];
    if (cartItemRefs.length > 0) {
      const rows = await prisma.product.findMany({
        where: {
          OR: [
            { id: { in: cartItemRefs } },
            { slug: { in: cartItemRefs } }
          ]
        },
        select: { id: true }
      });
      excludedProductIds = rows.map(r => r.id);
    }

    // 1. Fetch Manual Recommendations
    let recommendations = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        isRecommendation: true,
        ...(excludedProductIds.length > 0 ? { id: { notIn: excludedProductIds } } : {})
      },
      take: 4,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: { take: 1, select: { url: true } }
      }
    });

    console.log(`[Recommendations] Found ${recommendations.length} manual recommendations for cart refs: [${cartItemRefs.join(", ")}]`);
    recommendations.forEach(p => console.log(`  - Manual: ${p.name?.en || p.name} (${p.id})`));

    return NextResponse.json({
      success: true,
      data: recommendations.map(p => ({
        ...p,
        image: p.images?.[0]?.url || "/placeholder.png"
      }))
    });
  } catch (error) {
    console.error("RECOMMENDATIONS_ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
