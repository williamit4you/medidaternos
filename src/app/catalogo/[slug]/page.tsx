import Link from "next/link";
import { ArrowLeft, Check, MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/ProductGallery";
import StoreHeader from "@/components/StoreHeader";
import { getProductBySlug } from "@/lib/catalog";

export const dynamic = "force-dynamic";
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  const installment = product.priceCents / 100 / product.installments;
  const message = `Olá! Vi o produto "${product.title}" no catálogo da 4K Ternos. Valor: ${money.format(product.priceCents / 100)} (${product.installments}x de ${money.format(installment)} sem juros). Gostaria de comprar e saber mais detalhes. Link: ${process.env.NEXT_PUBLIC_APP_URL || ""}/catalogo/${product.slug}`;
  const whatsapp = `https://wa.me/5517997614534?text=${encodeURIComponent(message)}`;
  return <main className="min-h-screen bg-[#f8f4ed] text-[#22231e]"><StoreHeader compact /><div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-10"><Link href="/catalogo" className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm text-[#625e55]"><ArrowLeft size={17} /> Voltar ao catálogo</Link><div className="grid gap-8 md:grid-cols-2 md:gap-12"><ProductGallery images={product.images} /><section className="md:pt-8"><span className="text-[11px] font-bold uppercase tracking-[.25em] text-[#9b733b]">{product.category.name}</span><h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{product.title}</h1><div className="mt-6 border-y border-[#e2dbcf] py-5"><strong className="block text-3xl">{money.format(product.priceCents / 100)}</strong><span className="mt-1 block text-sm text-[#6d695f]">em até {product.installments}x de {money.format(installment)} sem juros</span></div><div className="mt-7 whitespace-pre-line text-[15px] leading-7 text-[#5f5c54]">{product.description}</div><ul className="mt-7 space-y-2 text-sm text-[#545149]"><li className="flex items-center gap-2"><Check size={16} className="text-[#9b733b]" /> Atendimento personalizado</li><li className="flex items-center gap-2"><Check size={16} className="text-[#9b733b]" /> Consulte tamanhos disponíveis</li></ul><a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-8 flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-[#1f7a4d] px-6 font-bold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[#17643e]"><MessageCircle /> Comprar pelo WhatsApp</a><p className="mt-3 text-center text-[11px] text-[#898378]">Você será atendido pela equipe 4K Ternos</p></section></div></div></main>;
}
