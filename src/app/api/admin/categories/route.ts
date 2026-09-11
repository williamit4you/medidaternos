import { NextResponse } from "next/server";
import { authorizeMutation, authorizeRead } from "@/lib/api";
import { getCategories } from "@/lib/catalog";
import { query } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { categorySchema } from "@/lib/validation";

export async function GET() {
  const denied = await authorizeRead();
  if (denied) return denied;
  return NextResponse.json({ categories: await getCategories() });
}

export async function POST(request: Request) {
  const denied = await authorizeMutation(request);
  if (denied) return denied;
  const parsed = categorySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Nome de categoria inválido." }, { status: 400 });
  try {
    const result = await query<{ id: string; name: string; slug: string }>(
      "INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id, name, slug",
      [parsed.data.name, slugify(parsed.data.name)],
    );
    return NextResponse.json({ category: result.rows[0] }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "23505") return NextResponse.json({ error: "Esta categoria já existe." }, { status: 409 });
    throw error;
  }
}
