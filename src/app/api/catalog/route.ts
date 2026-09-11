import { NextResponse } from "next/server";
import { getCatalog, getCategories } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const page = Math.max(1, Number(params.get("page")) || 1);
    const requested = Number(params.get("perPage")) || 10;
    const perPage = [10, 20, 50].includes(requested) ? requested : 10;
    const category = params.get("category")?.slice(0, 80) || undefined;
    const search = params.get("search")?.trim().slice(0, 120) || undefined;
    const [catalog, categories] = await Promise.all([getCatalog({ page, perPage, category, search }), getCategories()]);
    return NextResponse.json({ ...catalog, categories });
  } catch (error) {
    console.error("catalog_error", error);
    return NextResponse.json({ error: "Não foi possível carregar o catálogo." }, { status: 500 });
  }
}
