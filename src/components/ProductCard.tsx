"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { CatalogProduct } from "@/lib/catalog";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function ProductCard({ product, dense = false }: { product: CatalogProduct; dense?: boolean }) {
  const [current, setCurrent] = useState(0);
  const images = product.images;
  const installment = product.priceCents / 100 / product.installments;
  function move(event: React.MouseEvent, direction: number) {
    event.preventDefault();
    event.stopPropagation();
    setCurrent((value) => (value + direction + images.length) % images.length);
  }
  return (
    <article className="group overflow-hidden rounded-[22px] border border-[#e5ded2] bg-white shadow-[0_8px_30px_rgba(38,31,20,.06)] transition hover:-translate-y-1 hover:shadow-[0_14px_38px_rgba(38,31,20,.11)]">
      <Link href={`/catalogo/${product.slug}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ad7d37]">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#e9e4dc]">
          {images[current] ? <img src={images[current].url} alt={images[current].altText} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" /> : <div className="grid h-full place-items-center text-xs text-[#898276]">Imagem em breve</div>}
          <span className="absolute left-3 top-3 rounded-full bg-[#171814]/85 px-3 py-1 text-[10px] uppercase tracking-wider text-white backdrop-blur">{product.category.name}</span>
          {images.length > 1 && <>
            <button onClick={(event) => move(event, -1)} aria-label="Imagem anterior" className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#222] shadow"><ChevronLeft size={17} /></button>
            <button onClick={(event) => move(event, 1)} aria-label="Próxima imagem" className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#222] shadow"><ChevronRight size={17} /></button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">{images.map((image, index) => <span key={image.id} className={`h-1.5 rounded-full transition-all ${index === current ? "w-5 bg-white" : "w-1.5 bg-white/60"}`} />)}</div>
          </>}
        </div>
        <div className={dense ? "p-3" : "p-4 sm:p-5"}>
          <h2 className={`${dense ? "text-sm" : "text-lg"} line-clamp-2 font-serif font-semibold leading-tight text-[#20211d]`}>{product.title}</h2>
          {!dense && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#747064]">{product.description}</p>}
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-[#8b6731]">Tamanhos: {product.sizes.join(" · ")}</p>
          <div className={`${dense ? "mt-3" : "mt-5"} border-t border-[#eee9e1] pt-3`}>
            <strong className={`${dense ? "text-sm" : "text-xl"} block text-[#1b1c18]`}>{money.format(product.priceCents / 100)}</strong>
            <span className="text-[11px] text-[#777367]">ou {product.installments}x de {money.format(installment)} sem juros</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
