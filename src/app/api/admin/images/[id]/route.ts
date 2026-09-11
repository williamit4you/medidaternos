import { NextResponse } from "next/server";
import { authorizeMutation } from "@/lib/api";
import { query } from "@/lib/db";
import { minio, MINIO_BUCKET } from "@/lib/minio";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await authorizeMutation(request);
  if (denied) return denied;
  const { id } = await context.params;
  const result = await query<{ object_key: string }>("SELECT object_key FROM product_images WHERE id = $1", [id]);
  if (!result.rows[0]) return NextResponse.json({ error: "Imagem não encontrada." }, { status: 404 });
  await minio().removeObject(MINIO_BUCKET, result.rows[0].object_key);
  await query("DELETE FROM product_images WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
