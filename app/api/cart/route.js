import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

// Helper to get or create a session cart
async function getOrCreateCartId() {
  const cookieStore = await cookies();
  let cartId = cookieStore.get("prakrushi-cart-id")?.value;

  if (!cartId) {
    cartId = randomUUID();
  }
  return cartId;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("prakrushi-cart-id")?.value;

    if (!userId && !sessionId) {
      return NextResponse.json({ success: true, data: { items: [] } });
    }

    const cart = await prisma.cart.findUnique({
      where: userId ? { userId } : { sessionId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: { take: 1 }
              }
            }
          }
        }
      }
    });

    if (!cart) {
      return NextResponse.json({ success: true, data: { items: [] } });
    }

    return NextResponse.json({ success: true, data: cart });
  } catch (error) {
    console.error("GET_CART_ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { productId, variantId, quantity, action = "ADD", userId } = body;
    const cookieStore = await cookies();
    let sessionId = cookieStore.get("prakrushi-cart-id")?.value;

    if (!sessionId && !userId) {
      sessionId = randomUUID();
    }

    // Identify the cart to work with
    let cart = await prisma.cart.findUnique({
      where: userId ? { userId } : { sessionId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: userId ? { userId } : { sessionId }
      });
    }

    // --- MERGE LOGIC FOR LOGIN SYNC ---
    if (action === "MERGE" && userId && sessionId) {
      const guestCart = await prisma.cart.findUnique({
        where: { sessionId },
        include: { items: true }
      });

      if (guestCart && guestCart.userId !== userId) {
        for (const item of guestCart.items) {
          // Check if user already has this item
          const existingUserItem = await prisma.cartItem.findFirst({
            where: {
              cartId: cart.id,
              productId: item.productId,
              variantId: item.variantId
            }
          });

          if (existingUserItem) {
            await prisma.cartItem.update({
              where: { id: existingUserItem.id },
              data: { quantity: { increment: item.quantity } }
            });
          } else {
            await prisma.cartItem.create({
              data: {
                cartId: cart.id,
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity
              }
            });
          }
        }
        // Cleanup guest cart
        await prisma.cart.delete({ where: { id: guestCart.id } });
      }
    } 
    // --- STANDARD ACTIONS ---
    else if (action === "REMOVE") {
      if (!productId) {
        return NextResponse.json({ success: false, error: "productId is required" }, { status: 400 });
      }

      let resolvedProductId = productId;
      const productById = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true }
      });

      if (!productById) {
        const productBySlug = await prisma.product.findUnique({
          where: { slug: productId },
          select: { id: true }
        });

        if (productBySlug) {
          resolvedProductId = productBySlug.id;
        }
      }

      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          productId: resolvedProductId,
          variantId: variantId || null
        }
      });
    } else {
      // Resolve product ID (some clients may send slug by mistake)
      if (!productId) {
        return NextResponse.json({ success: false, error: "productId is required" }, { status: 400 });
      }

      let resolvedProductId = productId;
      const productById = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true }
      });

      if (!productById) {
        const productBySlug = await prisma.product.findUnique({
          where: { slug: productId },
          select: { id: true }
        });

        if (!productBySlug) {
          return NextResponse.json(
            { success: false, error: "Invalid productId (product not found)" },
            { status: 400 }
          );
        }

        resolvedProductId = productBySlug.id;
      }

      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: resolvedProductId,
          variantId: variantId || null
        }
      });

      if (action === "SET") {
        if (existingItem) {
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity }
          });
        } else {
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId: resolvedProductId,
              variantId: variantId || null,
              quantity
            }
          });
        }
      } else if (action === "ADD") {
        if (existingItem) {
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: { increment: quantity || 1 } }
          });
        } else {
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId: resolvedProductId,
              variantId: variantId || null,
              quantity: quantity || 1
            }
          });
        }
      }
    }

    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: { take: 1 }
              }
            }
          }
        }
      }
    });

    const response = NextResponse.json({ success: true, data: updatedCart });
    
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
    console.error("POST_CART_ERROR:", error);
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
      await prisma.cart.deleteMany({ where: { userId } });
    } else if (sessionId) {
      await prisma.cart.deleteMany({ where: { sessionId } });
    }

    return NextResponse.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
