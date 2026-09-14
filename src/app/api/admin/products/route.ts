import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { authorizeMutation, authorizeRead } from "@/lib/api";
import { getCatalog } from "@/lib/catalog";
import { query } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { productSchema } from "@/lib/validation";

export async function GET() {
  const denied = await authorizeRead();
  if (denied) return denied;
  return NextResponse.json(await getCatalog({ page: 1, perPage: 1000, includeInactive: true }));
}

export async function POST(request: Request) {
  const denied = await authorizeMutation(request);
  if (denied) return denied;
  const parsed = productSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revise os dados do produto.", details: parsed.error.flatten() }, { status: 400 });
  const slug = `${slugify(parsed.data.title)}-${randomBytes(3).toString("hex")}`;
  const result = await query<{ id: string; slug: string }>(`
    INSERT INTO products (category_id, title, slug, description, price_cents, installments, sizes, active)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, slug`,
    [parsed.data.categoryId, parsed.data.title, slug, parsed.data.description, parsed.data.priceCents, parsed.data.installments, parsed.data.sizes, parsed.data.active],
  );
  return NextResponse.json({ product: result.rows[0] }, { status: 201 });
}
