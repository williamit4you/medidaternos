"use client";

import { ListFilter, Search, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { CatalogProduct } from "@/lib/catalog";
import ProductCard from "./ProductCard";

type Category = { id: string; name: string; slug: string; productCount: number };
type Payload = { products: CatalogProduct[]; categories: Category[]; total: number; page: number; pages: number; perPage: number };

export default function CatalogClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [columns, setColumns] = useState<1 | 2 | 4 | 8>(2);
  const queryString = searchParams.toString();

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/catalog?${queryString}`, { signal: controller.signal })
      .then(async (response) => { if (!response.ok) throw new Error(); return response.json(); })
      .then(setData).catch((reason) => { if (reason.name !== "AbortError") setError("Não foi possível carregar o catálogo agora."); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [queryString]);

  const update = useCallback((changes: Record<string, string | null>) => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => value ? params.set(key, value) : params.delete(key));
    router.replace(`/catalogo?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const category = searchParams.get("category") || "";
  const perPage = Number(searchParams.get("perPage")) || 10;
  const grid = { 1: "grid-cols-1 max-w-xl", 2: "grid-cols-2", 4: "grid-cols-2 md:grid-cols-3 xl:grid-cols-4", 8: "grid-cols-2 md:grid-cols-4 xl:grid-cols-8" }[columns];

  return (
    <>
      <section className="border-b border-[#e7dfd2] bg-[#ede6db]">
        <div className="mx-auto max-w-[1600px] px-4 py-9 sm:px-6 sm:py-14">
          <span className="text-[10px] font-bold uppercase tracking-[.32em] text-[#9b733b]">Coleção 4K</span>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-[1.05] text-[#20211d] sm:text-6xl">O terno certo muda tudo.</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#69665d] sm:text-base">Peças selecionadas para ocasiões que merecem presença. Escolha seu modelo e fale diretamente com nossa equipe.</p>
        </div>
      </section>
      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 sm:py-8">
        <form onSubmit={(event) => { event.preventDefault(); update({ search: search.trim() || null, page: null }); }} className="flex gap-2">
          <label className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#817b70]" size={18} /><span className="sr-only">Buscar</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar modelo, tecido ou categoria" className="h-12 w-full rounded-full border border-[#ded6ca] bg-white pl-11 pr-4 text-sm text-[#22231e] outline-none focus:border-[#a57a3e]" /></label>
          <button className="h-12 rounded-full bg-[#1c1d19] px-5 text-sm font-semibold text-white"><span className="hidden sm:inline">Buscar</span><Search className="sm:hidden" size={18} /></button>
        </form>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2" aria-label="Categorias">
          <button onClick={() => update({ category: null, page: null })} className={`min-h-11 shrink-0 rounded-full px-5 text-sm ${!category ? "bg-[#a87938] text-white" : "border border-[#ded6ca] bg-white text-[#555249]"}`}>Todos</button>
          {data?.categories.map((item) => <button key={item.id} onClick={() => update({ category: item.slug, page: null })} className={`min-h-11 shrink-0 rounded-full px-5 text-sm ${category === item.slug ? "bg-[#a87938] text-white" : "border border-[#ded6ca] bg-white text-[#555249]"}`}>{item.name} <span className="opacity-60">{item.productCount}</span></button>)}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-[#e9e2d8] py-4">
          <span className="flex items-center gap-2 text-xs text-[#767166]"><ListFilter size={15} /> {data ? `${data.total} peças` : "Carregando..."}</span>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-[#6d695f]"><span className="hidden sm:inline">Por página</span><select value={perPage} onChange={(event) => update({ perPage: event.target.value, page: null })} className="h-10 rounded-full border border-[#ddd5c9] bg-white px-3"><option>10</option><option>20</option><option>50</option></select></label>
            <div className="flex rounded-full border border-[#ddd5c9] bg-white p-1" aria-label="Colunas por linha">
              {[1,2,4,8].map((count) => <button key={count} onClick={() => setColumns(count as 1|2|4|8)} title={`${count} por linha`} aria-label={`${count} por linha`} className={`grid h-8 min-w-8 place-items-center rounded-full px-2 text-xs ${columns === count ? "bg-[#22231e] text-white" : "text-[#767166]"}`}>{count}</button>)}
            </div>
          </div>
        </div>
        {error && <div className="my-10 rounded-2xl bg-red-50 p-5 text-center text-sm text-red-700">{error}</div>}
        {loading && <div className="grid grid-cols-2 gap-3 py-7 md:grid-cols-4">{[1,2,3,4].map((i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-[22px] bg-[#e8e1d6]" />)}</div>}
        {!loading && data?.products.length === 0 && <div className="py-20 text-center"><SlidersHorizontal className="mx-auto text-[#9d9589]" /><h2 className="mt-4 font-serif text-2xl text-[#292a25]">Nenhuma peça encontrada</h2><p className="mt-2 text-sm text-[#777267]">Tente outro termo ou selecione todas as categorias.</p></div>}
        {!loading && data && <div className={`mx-auto grid gap-3 py-7 sm:gap-5 ${grid}`}>{data.products.map((product) => <ProductCard key={product.id} product={product} dense={columns >= 4} />)}</div>}
        {data && data.pages > 1 && <nav className="flex items-center justify-center gap-2 py-5" aria-label="Paginação">
          <button disabled={data.page <= 1} onClick={() => update({ page: String(data.page - 1) })} className="min-h-11 rounded-full border border-[#ddd5c9] bg-white px-4 text-sm disabled:opacity-40">Anterior</button>
          <span className="px-3 text-sm text-[#666259]">{data.page} / {data.pages}</span>
          <button disabled={data.page >= data.pages} onClick={() => update({ page: String(data.page + 1) })} className="min-h-11 rounded-full bg-[#20211d] px-4 text-sm text-white disabled:opacity-40">Próxima</button>
        </nav>}
      </div>
    </>
  );
}
