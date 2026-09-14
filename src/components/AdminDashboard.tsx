"use client";

import { ExternalLink, ImagePlus, LogOut, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { CatalogProduct } from "@/lib/catalog";

type Category = { id: string; name: string; slug: string; productCount: number };
const SUIT_SIZES = ["42", "44", "46", "48", "50", "52", "54", "56", "58", "60", "62", "64"];
const emptyForm = { id: "", title: "", description: "", categoryId: "", price: "", installments: "5", sizes: [] as string[], active: true };

export default function AdminDashboard({ email }: { email: string }) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<File[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [categoryName, setCategoryName] = useState("");

  async function load() {
    const [productResponse, categoryResponse] = await Promise.all([fetch("/api/admin/products"), fetch("/api/admin/categories")]);
    if (productResponse.status === 401 || categoryResponse.status === 401) { window.location.assign("/login"); return; }
    const productData = await productResponse.json(); const categoryData = await categoryResponse.json();
    setProducts(productData.products || []); setCategories(categoryData.categories || []);
  }
  useEffect(() => {
    let active = true;
    Promise.all([fetch("/api/admin/products"), fetch("/api/admin/categories")]).then(async ([productResponse, categoryResponse]) => {
      if (!active) return;
      if (productResponse.status === 401 || categoryResponse.status === 401) { window.location.assign("/login"); return; }
      const [productData, categoryData] = await Promise.all([productResponse.json(), categoryResponse.json()]);
      if (active) { setProducts(productData.products || []); setCategories(categoryData.categories || []); }
    });
    return () => { active = false; };
  }, []);

  function startCreate() { setForm({ ...emptyForm, categoryId: categories[0]?.id || "" }); setFiles([]); setOpen(true); }
  function startEdit(product: CatalogProduct) { setForm({ id: product.id, title: product.title, description: product.description, categoryId: product.category.id, price: (product.priceCents / 100).toFixed(2).replace(".", ","), installments: String(product.installments), sizes: product.sizes, active: product.active }); setFiles([]); setOpen(true); }

  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setNotice("");
    const payload = { title: form.title, description: form.description, categoryId: form.categoryId, priceCents: Math.round(Number(form.price.replace(",", ".")) * 100), installments: Number(form.installments), sizes: form.sizes, active: form.active };
    const response = await fetch(form.id ? `/api/admin/products/${form.id}` : "/api/admin/products", { method: form.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) { setNotice(body.error || "Não foi possível salvar."); setBusy(false); return; }
    const productId = form.id || body.product.id;
    if (files.length) { const upload = new FormData(); files.forEach((file) => upload.append("images", file)); const uploaded = await fetch(`/api/admin/products/${productId}/images`, { method: "POST", body: upload }); if (!uploaded.ok) { const uploadBody = await uploaded.json().catch(() => ({})); setNotice(`Produto salvo, mas as imagens falharam: ${uploadBody.error || "erro no envio"}`); setBusy(false); await load(); return; } }
    setOpen(false); setNotice("Produto salvo com sucesso."); setBusy(false); await load();
  }
  async function removeProduct(product: CatalogProduct) { if (!confirm(`Excluir definitivamente “${product.title}”?`)) return; const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" }); if (response.ok) { setNotice("Produto excluído."); await load(); } else setNotice("Não foi possível excluir o produto."); }
  async function removeImage(id: string) { if (!confirm("Remover esta imagem?")) return; const response = await fetch(`/api/admin/images/${id}`, { method: "DELETE" }); if (response.ok) await load(); }
  async function addCategory(event: React.FormEvent) { event.preventDefault(); const response = await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: categoryName }) }); const body = await response.json().catch(() => ({})); if (response.ok) { setCategoryName(""); setNotice("Categoria criada."); await load(); } else setNotice(body.error || "Não foi possível criar a categoria."); }
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); window.location.assign("/login"); }
  const editing = products.find((product) => product.id === form.id);

  return <div className="min-h-screen bg-[#f5f1ea] text-[#22231e]">
    <header className="border-b border-[#dfd8cc] bg-[#1c1d19] text-white"><div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6"><div><strong className="font-serif tracking-[.16em] text-[#d8b170]">4K TERNOS</strong><p className="text-[10px] text-white/45">{email}</p></div><div className="flex gap-1"><Link href="/catalogo" target="_blank" className="inline-flex h-11 items-center gap-2 rounded-full px-3 text-xs hover:bg-white/10"><ExternalLink size={16} /><span className="hidden sm:inline">Ver catálogo</span></Link><button onClick={logout} className="inline-flex h-11 items-center gap-2 rounded-full px-3 text-xs hover:bg-white/10"><LogOut size={16} /><span className="hidden sm:inline">Sair</span></button></div></div></header>
    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><span className="text-[10px] font-bold uppercase tracking-[.25em] text-[#99713a]">Administração</span><h1 className="mt-2 font-serif text-4xl">Seu catálogo</h1><p className="mt-1 text-sm text-[#736e64]">{products.length} produtos e {categories.length} categorias</p></div><button onClick={startCreate} disabled={!categories.length} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#a87938] px-5 text-sm font-bold text-white disabled:opacity-50"><Plus size={18} /> Novo produto</button></div>
      {notice && <div className="mt-5 flex items-center justify-between rounded-xl border border-[#dfd5c6] bg-white p-4 text-sm"><span>{notice}</span><button onClick={() => setNotice("")}><X size={16} /></button></div>}
      <section className="mt-7 rounded-2xl border border-[#e1dacf] bg-white p-4 sm:p-5"><h2 className="font-serif text-xl">Categorias</h2><form onSubmit={addCategory} className="mt-3 flex gap-2"><input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} required minLength={2} placeholder="Nova categoria" className="h-11 min-w-0 flex-1 rounded-xl border border-[#ded6ca] px-4 text-sm outline-none focus:border-[#aa7b3a]" /><button className="h-11 rounded-xl bg-[#24251f] px-4 text-sm text-white">Adicionar</button></form><div className="mt-3 flex gap-2 overflow-x-auto">{categories.map((category) => <span key={category.id} className="shrink-0 rounded-full bg-[#f2eee7] px-3 py-1.5 text-xs">{category.name} · {category.productCount}</span>)}</div></section>
      <section className="mt-5 overflow-hidden rounded-2xl border border-[#e1dacf] bg-white"><div className="flex items-center justify-between border-b border-[#eee8de] p-4 sm:p-5"><h2 className="font-serif text-xl">Produtos</h2><button onClick={load} aria-label="Atualizar" className="grid h-10 w-10 place-items-center rounded-full hover:bg-[#f3efe8]"><RefreshCw size={16} /></button></div><div className="divide-y divide-[#eee8de]">{products.map((product) => <div key={product.id} className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4"><div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-[#ece7df]">{product.images[0] && <img src={product.images[0].url} alt="" className="h-full w-full object-cover" />}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className="truncate font-serif text-lg">{product.title}</h3>{!product.active && <span className="rounded bg-neutral-200 px-2 py-0.5 text-[9px] uppercase">Oculto</span>}</div><p className="mt-1 text-xs text-[#79746b]">{product.category.name} · {(product.priceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} · {product.images.length} imagens</p></div><button onClick={() => startEdit(product)} aria-label="Editar" className="grid h-11 w-11 place-items-center rounded-full hover:bg-[#f1ede6]"><Pencil size={17} /></button><button onClick={() => removeProduct(product)} aria-label="Excluir" className="grid h-11 w-11 place-items-center rounded-full text-red-600 hover:bg-red-50"><Trash2 size={17} /></button></div>)}{!products.length && <p className="p-8 text-center text-sm text-[#7d786e]">Nenhum produto cadastrado.</p>}</div></section>
    </main>
    {open && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"><div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] bg-[#faf7f2] p-5 sm:rounded-[28px] sm:p-7"><div className="flex items-center justify-between"><div><span className="text-[10px] font-bold uppercase tracking-widest text-[#99713a]">{form.id ? "Editar" : "Cadastrar"}</span><h2 className="font-serif text-3xl">Produto</h2></div><button onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center rounded-full bg-[#eee8de]"><X /></button></div><form onSubmit={save} className="mt-6 space-y-4">
      <label className="block"><span className="mb-1.5 block text-xs font-bold">Título</span><input required minLength={3} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-12 w-full rounded-xl border border-[#ddd5c9] bg-white px-4 outline-none focus:border-[#a87938]" /></label>
      <label className="block"><span className="mb-1.5 block text-xs font-bold">Descrição completa</span><textarea required minLength={10} rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-[#ddd5c9] bg-white p-4 outline-none focus:border-[#a87938]" /></label>
      <div className="grid grid-cols-2 gap-3"><label><span className="mb-1.5 block text-xs font-bold">Categoria</span><select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="h-12 w-full rounded-xl border border-[#ddd5c9] bg-white px-3">{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label><span className="mb-1.5 block text-xs font-bold">Parcelas</span><input type="number" min="1" max="24" required value={form.installments} onChange={(e) => setForm({ ...form, installments: e.target.value })} className="h-12 w-full rounded-xl border border-[#ddd5c9] bg-white px-4" /></label></div>
      <label className="block"><span className="mb-1.5 block text-xs font-bold">Preço total (R$)</span><input inputMode="decimal" required placeholder="699,00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="h-12 w-full rounded-xl border border-[#ddd5c9] bg-white px-4" /></label>
      <fieldset><legend className="mb-2 text-xs font-bold">Tamanhos disponíveis</legend><div className="flex flex-wrap gap-2">{SUIT_SIZES.map((size) => { const checked = form.sizes.includes(size); return <label key={size} className={`grid h-10 min-w-10 cursor-pointer place-items-center rounded-lg border px-2 text-sm font-bold transition ${checked ? "border-[#a87938] bg-[#a87938] text-white" : "border-[#ddd5c9] bg-white text-[#5c574e]"}`}><input type="checkbox" checked={checked} onChange={() => setForm((current) => ({ ...current, sizes: checked ? current.sizes.filter((item) => item !== size) : [...current.sizes, size] }))} className="sr-only" />{size}</label>; })}</div><p className="mt-2 text-[11px] text-[#827c72]">Selecione todos os tamanhos disponíveis deste produto.</p></fieldset>
      {editing?.images.length ? <div><span className="mb-2 block text-xs font-bold">Imagens atuais</span><div className="flex gap-2 overflow-x-auto">{editing.images.map((image) => <div key={image.id} className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl"><img src={image.url} alt="" className="h-full w-full object-cover" /><button type="button" onClick={() => removeImage(image.id)} className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-red-600 text-white"><X size={14} /></button></div>)}</div></div> : null}
      <label className="block rounded-2xl border border-dashed border-[#cfc5b7] bg-white p-5 text-center"><ImagePlus className="mx-auto text-[#9a815b]" /><span className="mt-2 block text-sm font-bold">Adicionar imagens</span><span className="block text-xs text-[#827c72]">JPG, PNG, WebP ou AVIF · até 8 MB cada</span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="mt-3 block w-full text-xs" />{files.length > 0 && <span className="mt-2 block text-xs text-[#8d672e]">{files.length} arquivo(s) selecionado(s)</span>}</label>
      <label className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-5 w-5 accent-[#a87938]" /><span className="text-sm">Produto visível no catálogo</span></label>
      {notice && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{notice}</p>}<button disabled={busy} className="h-13 w-full rounded-xl bg-[#20211d] font-bold text-white disabled:opacity-50">{busy ? "Salvando..." : "Salvar produto"}</button>
    </form></div></div>}
  </div>;
}
