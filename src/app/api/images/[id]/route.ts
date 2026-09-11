import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { minio, MINIO_BUCKET } from "@/lib/minio";

export const dynamic = "force-dynamic";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const result = await query<{ object_key: string; mime_type: string }>("SELECT object_key, mime_type FROM product_images WHERE id = $1", [id]);
  const image = result.rows[0];
  if (!image) return new NextResponse("Imagem não encontrada", { status: 404 });
  try {
    const stream = await minio().getObject(MINIO_BUCKET, image.object_key);
    return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
      headers: { "Content-Type": image.mime_type, "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800", "X-Content-Type-Options": "nosniff" },
    });
  } catch (error) {
    console.error("image_error", error);
    return new NextResponse("Imagem indisponível", { status: 404 });
  }
}
