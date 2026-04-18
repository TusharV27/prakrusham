import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        category: true,
        vendor: true,
        farmer: { 
          include: { 
            user: true,
            metafields: true
          } 
        },
        images: true,
        variants: { include: { metafields: true } },
        metafields: true,
        offers: true,
        inventoryItems: { include: { warehouse: true } },
        reviews: { include: { author: true } },
        shippingProfile: true,
      },
    });
    if (!product) return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    const formatted = {
      ...product,
      name: typeof product.name === "object" && product.name !== null ? product.name : { en: product.name || "", hi: "", gu: "" },
      summaryHtml: typeof product.shortDesc === "object" && product.shortDesc !== null ? product.shortDesc : { en: product.shortDesc || "", hi: "", gu: "" },
      bodyHtml: typeof product.description === "object" && product.description !== null ? product.description : { en: product.description || "", hi: "", gu: "" },
      variants: Array.isArray(product.variants) ? product.variants.map((v) => ({ ...v, quantity: v.quantity || 0 })) : [],
    };
    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch product", details: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const contentType = request.headers.get("content-type") || "";
    let body = {};
    let files = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        if (key !== "images") {
          body[key] = value;
        }
      });
      files = formData.getAll("images");
    } else {
      body = await request.json();
      files = body.images || [];
    }

    const {
      name, nameHi, nameGu,
      slug,
      summaryHtml, summaryHtmlHi, summaryHtmlGu,
      bodyHtml, bodyHtmlHi, bodyHtmlGu,
      price,
      compareAtPrice,
      costPerItem,
      sku,
      barcode,
      weight,
      isTaxable,
      taxRate,
      status,
      categoryId,
      vendorId,
      farmerId,
      tags,
      metaTitle, metaTitleHi, metaTitleGu,
      metaDescription, metaDescriptionHi, metaDescriptionGu,
      shippingProfileId,
      existingImages = "[]"
    } = body;

    let variants = body.variants || [];
    let metafields = body.metafields || [];
    let options = body.options || [];

    // Parse JSON safely
    if (typeof variants === "string") {
      try { variants = JSON.parse(variants); } catch { variants = []; }
    }
    if (typeof metafields === "string") {
      try { metafields = JSON.parse(metafields); } catch { metafields = []; }
    }
    if (typeof options === "string") {
      try { options = JSON.parse(options); } catch { options = []; }
    }
    const currentExistingImages = typeof existingImages === "string" ? JSON.parse(existingImages) : existingImages;

    // Number parser
    const parseNumber = (val, def = null) => {
      if (val === null || val === undefined || val === "" || val === "null") return def;
      const n = parseFloat(val);
      return isNaN(n) ? def : n;
    };

    // Upload new images
    const uploadDir = path.join(process.cwd(), "public/uploads/products");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadedImages = [];
    for (const file of files) {
      if (file && typeof file === "object" && file.name) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, buffer);
        uploadedImages.push({ url: `/uploads/products/${fileName}` });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update Product Base Info
      const product = await tx.product.update({
        where: { id },
        data: {
          name: typeof name === "object" ? name : {
            en: String(name || ""),
            hi: String(nameHi || ""),
            gu: String(nameGu || "")
          },
          slug,
          shortDesc: typeof summaryHtml === "object" ? summaryHtml : {
            en: String(summaryHtml || ""),
            hi: String(summaryHtmlHi || ""),
            gu: String(summaryHtmlGu || "")
          },
          description: typeof bodyHtml === "object" ? bodyHtml : {
            en: String(bodyHtml || ""),
            hi: String(bodyHtmlHi || ""),
            gu: String(bodyHtmlGu || "")
          },
          price: parseNumber(price, 0),
          compareAtPrice: parseNumber(compareAtPrice),
          costPerItem: parseNumber(costPerItem),
          sku: sku || null,
          barcode: barcode || null,
          weight: parseNumber(weight),
          isTaxable: String(isTaxable) === "true" || isTaxable === true,
          taxRate: parseNumber(taxRate, 5.0),
          status: status || "DRAFT",
          categoryId: categoryId || null,
          vendorId: vendorId || null,
          farmerId: farmerId || null,
          tags: tags || null,
          options: options.filter(opt => opt.name && opt.values?.length),
          metaTitle: typeof metaTitle === "object" ? metaTitle : {
            en: metaTitle || "",
            hi: metaTitleHi || "",
            gu: metaTitleGu || ""
          },
          metaDescription: typeof metaDescription === "object" ? metaDescription : {
            en: metaDescription || "",
            hi: metaDescriptionHi || "",
            gu: metaDescriptionGu || ""
          },
          shippingProfileId: shippingProfileId || null,
        }
      });

      // 2. Handle Images
      // Delete images not in existingImages
      await tx.image.deleteMany({
        where: {
          productId: id,
          url: { notIn: currentExistingImages }
        }
      });
      // Add new images
      if (uploadedImages.length) {
        await tx.image.createMany({
          data: uploadedImages.map(img => ({
            url: img.url,
            productId: id
          }))
        });
      }

      // 3. Handle Metafields (Product Level)
      await tx.productMetafield.deleteMany({ where: { productId: id } });
      if (metafields.length) {
        await tx.productMetafield.createMany({
          data: metafields.map(m => ({
            productId: id,
            namespace: m.namespace || "custom",
            key: m.key,
            value: String(m.value ?? ""),
            type: m.type || "text",
          }))
        });
      }

      // 4. Handle Variants
      // Simple strategy: Clear and recreate or update
      // For more stability, we keep existing and add new
      const existingVariants = await tx.productVariant.findMany({ where: { productId: id } });
      const currentVariantIds = variants.map(v => v.id).filter(Boolean);
      
      // Delete removed variants
      await tx.productVariant.deleteMany({
        where: {
          productId: id,
          id: { notIn: currentVariantIds }
        }
      });

      for (const v of variants) {
        const vData = {
          title: v.title || v.name || "Default Variant",
          sku: v.sku || null,
          barcode: v.barcode || null,
          price: parseNumber(v.price, 0),
          compareAtPrice: parseNumber(v.compareAtPrice),
          costPerItem: parseNumber(v.costPerItem),
          weight: parseNumber(v.weight),
          quantity: parseInt(v.stock || v.quantity) || 0,
          isDefault: v.isDefault === true || v.isDefault === "true",
          isActive: v.isActive !== false && v.isActive !== "false",
          options: v.options || null,
          productId: id
        };

        let vId = v.id;
        if (vId) {
          await tx.productVariant.update({ where: { id: vId }, data: vData });
        } else {
          vId = (await tx.productVariant.create({ data: vData })).id;
        }

        // Handle Variant Metafields
        const vMeta = typeof v.metafields === "string" ? JSON.parse(v.metafields) : (v.metafields || []);
        await tx.productVariantMetafield.deleteMany({ where: { variantId: vId } });
        if (vMeta.length) {
          await tx.productVariantMetafield.createMany({
            data: vMeta.map(m => ({
              variantId: vId,
              key: m.key,
              value: String(m.value ?? ""),
              type: m.type || "text",
              namespace: m.namespace || "custom"
            }))
          });
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          images: true,
          variants: { include: { metafields: true } },
          metafields: true
        }
      });
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT PRODUCT ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product", details: error.message },
      { status: 500 }
    );
  }
}

