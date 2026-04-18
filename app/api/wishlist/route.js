import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("prakrushi-cart-id")?.value;

    if (!userId && !sessionId) {
      return NextResponse.json({ success: true, data: { items: [] } });
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: userId ? { userId } : { sessionId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 },
                variants: true,
                category: true,
                farmer: {
                  include: {
                    user: {
                      select: { name: true }
                    }
                  }
                },
                reviews: {
                  where: { status: 'APPROVED' },
                  select: { rating: true }
                }
              }
            }
          }
        }
      }
    });

    if (!wishlist) {
      return NextResponse.json({ success: true, data: { items: [] } });
    }

    // Format the items to match what ProductCard expects
    const formattedItems = wishlist.items.map(item => {
      const p = item.product;
      const totalInventory = (p.variants || []).reduce((sum, v) => sum + (v.quantity || 0), 0);

      return {
        ...item,
        product: {
          ...p,
          image: p.images?.[0]?.url || "/placeholder.png",
          farmerName: p.farmer?.user?.name?.en || (typeof p.farmer?.user?.name === 'string' ? p.farmer.user.name : ''),
          categoryName: p.category?.name?.en || (typeof p.category?.name === 'string' ? p.category.name : ''),
          inventory: totalInventory,
          stock: totalInventory,
          rating: p.reviews?.length > 0 
            ? Number((p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length).toFixed(1)) 
            : 0,
          reviewCount: p.reviews?.length || 0,
        }
      };
    });

    return NextResponse.json({ 
      success: true, 
      data: { ...wishlist, items: formattedItems } 
    });
  } catch (error) {
    console.error("GET_WISHLIST_ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { productId, userId, action } = body;
    const cookieStore = await cookies();
    let sessionId = cookieStore.get("prakrushi-cart-id")?.value;

    if (!sessionId && !userId) {
      sessionId = randomUUID();
    }

    // Identify/Create user wishlist
    let wishlist = await prisma.wishlist.findUnique({
      where: userId ? { userId } : { sessionId }
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: userId ? { userId } : { sessionId }
      });
    }

    // --- MERGE LOGIC ---
    if (action === "MERGE" && userId && sessionId) {
      const guestWishlist = await prisma.wishlist.findUnique({
        where: { sessionId },
        include: { items: true }
      });

      if (guestWishlist && guestWishlist.userId !== userId) {
        for (const item of guestWishlist.items) {
          const exists = await prisma.wishlistItem.findFirst({
            where: { wishlistId: wishlist.id, productId: item.productId }
          });
          if (!exists) {
            await prisma.wishlistItem.create({
              data: { wishlistId: wishlist.id, productId: item.productId }
            });
          }
        }
        await prisma.wishlist.delete({ where: { id: guestWishlist.id } });
      }
    } 
    // --- TOGGLE LOGIC ---
    else if (productId) {
      const existingItem = await prisma.wishlistItem.findFirst({
        where: {
          wishlistId: wishlist.id,
          productId
        }
      });

      if (existingItem) {
        await prisma.wishlistItem.delete({ where: { id: existingItem.id } });
      } else {
        await prisma.wishlistItem.create({
          data: {
            wishlistId: wishlist.id,
            productId
          }
        });
      }
    }

    // Return updated wishlist (full data)
    const updatedWishlist = await prisma.wishlist.findUnique({
      where: { id: wishlist.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 },
                variants: true,
                category: true,
                farmer: {
                  include: {
                    user: {
                      select: { name: true }
                    }
                  }
                },
                reviews: {
                  where: { status: 'APPROVED' },
                  select: { rating: true }
                }
              }
            }
          }
        }
      }
    });

    const formattedItems = updatedWishlist.items.map(item => {
      const p = item.product;
      const totalInventory = (p.variants || []).reduce((sum, v) => sum + (v.quantity || 0), 0);
      return {
        ...item,
        product: {
          ...p,
          image: p.images?.[0]?.url || "/placeholder.png",
          farmerName: p.farmer?.user?.name?.en || (typeof p.farmer?.user?.name === 'string' ? p.farmer.user.name : ''),
          categoryName: p.category?.name?.en || (typeof p.category?.name === 'string' ? p.category.name : ''),
          inventory: totalInventory,
          stock: totalInventory,
          rating: p.reviews?.length > 0 
            ? Number((p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length).toFixed(1)) 
            : 0,
          reviewCount: p.reviews?.length || 0,
        }
      };
    });

    const response = NextResponse.json({ 
      success: true, 
      data: { ...updatedWishlist, items: formattedItems } 
    });
    
    if (sessionId) {
      response.cookies.set("prakrushi-cart-id", sessionId, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
        httpOnly: true,
        sameSite: "lax"
      });
    }

    return response;
  } catch (error) {
    console.error("POST_WISHLIST_ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("prakrushi-cart-id")?.value;

    if (userId) {
      await prisma.wishlist.deleteMany({ where: { userId } });
    } else if (sessionId) {
      await prisma.wishlist.deleteMany({ where: { sessionId } });
    }

    return NextResponse.json({ success: true, message: "Wishlist cleared" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
