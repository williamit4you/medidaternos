import { NextResponse } from "next/server";
import { authorizeMutation, authorizeRead } from "@/lib/api";
import { getProductById } from "@/lib/catalog";
import { query } from "@/lib/db";
import { minio, MINIO_BUCKET } from "@/lib/minio";
import { productSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, context: Context) {
  const denied = await authorizeRead();
  if (denied) return denied;
  const product = await getProductById((await context.params).id);
  return product ? NextResponse.json({ product }) : NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
}

export async function PUT(request: Request, context: Context) {
  const denied = await authorizeMutation(request);
  if (denied) return denied;
  const parsed = productSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revise os dados do produto." }, { status: 400 });
  const { id } = await context.params;
  const result = await query(`UPDATE products SET category_id=$1, title=$2, description=$3, price_cents=$4, installments=$5, active=$6, updated_at=NOW() WHERE id=$7 RETURNING id`,
    [parsed.data.categoryId, parsed.data.title, parsed.data.description, parsed.data.priceCents, parsed.data.installments, parsed.data.active, id]);
  return result.rowCount ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
}

export async function DELETE(request: Request, context: Context) {
  const denied = await authorizeMutation(request);
  if (denied) return denied;
  const { id } = await context.params;
  const images = await query<{ object_key: string }>("SELECT object_key FROM product_images WHERE product_id = $1", [id]);
  if (images.rows.length) await minio().removeObjects(MINIO_BUCKET, images.rows.map((image) => image.object_key));
  const result = await query("DELETE FROM products WHERE id = $1", [id]);
  return result.rowCount ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
}
