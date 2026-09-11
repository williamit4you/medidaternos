"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { CatalogImage } from "@/lib/catalog";

export default function ProductGallery({ images }: { images: CatalogImage[] }) {
  const [current, setCurrent] = useState(0);
  const move = (direction: number) => setCurrent((value) => (value + direction + images.length) % images.length);
  return <div>
    <div className="relative aspect-[4/5] overflow-hidden rounded-[26px] bg-[#e9e3da]">
      {images[current] ? <img src={images[current].url} alt={images[current].altText} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-sm text-[#857f74]">Imagem em breve</div>}
      {images.length > 1 && <><button onClick={() => move(-1)} aria-label="Imagem anterior" className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow"><ChevronLeft /></button><button onClick={() => move(1)} aria-label="Próxima imagem" className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow"><ChevronRight /></button></>}
    </div>
    {images.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto">{images.map((image, index) => <button key={image.id} onClick={() => setCurrent(index)} className={`h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${index === current ? "border-[#a87938]" : "border-transparent"}`}><img src={image.url} alt="" className="h-full w-full object-cover" /></button>)}</div>}
  </div>;
}
