import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { authorizeMutation } from "@/lib/api";
import { query } from "@/lib/db";
import { minio, MINIO_BUCKET } from "@/lib/minio";

const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const maxBytes = 8 * 1024 * 1024;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await authorizeMutation(request);
  if (denied) return denied;
  const { id } = await context.params;
  const exists = await query("SELECT id FROM products WHERE id = $1", [id]);
  if (!exists.rowCount) return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  const form = await request.formData();
  const files = form.getAll("images").filter((value): value is File => value instanceof File);
  if (!files.length || files.length > 8) return NextResponse.json({ error: "Envie de 1 a 8 imagens." }, { status: 400 });
  if (files.some((file) => !allowed.has(file.type) || file.size > maxBytes)) return NextResponse.json({ error: "Use JPG, PNG, WebP ou AVIF com até 8 MB por imagem." }, { status: 400 });

  const storage = minio();
  if (!(await storage.bucketExists(MINIO_BUCKET))) await storage.makeBucket(MINIO_BUCKET);
  const orderResult = await query<{ next: number }>("SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM product_images WHERE product_id = $1", [id]);
  let order = Number(orderResult.rows[0]?.next || 0);
  const created: string[] = [];
  try {
    for (const file of files) {
      const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
      const key = `produtos/${id}/${randomUUID()}.${extension}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await storage.putObject(MINIO_BUCKET, key, buffer, buffer.length, { "Content-Type": file.type });
      await query("INSERT INTO product_images (product_id, object_key, alt_text, sort_order, mime_type) VALUES ($1, $2, $3, $4, $5)", [id, key, file.name.replace(/\.[^.]+$/, ""), order++, file.type]);
      created.push(key);
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (created.length) await storage.removeObjects(MINIO_BUCKET, created).catch(() => undefined);
    throw error;
  }
}
