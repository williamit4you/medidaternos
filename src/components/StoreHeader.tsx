import Link from "next/link";
import { Ruler, Shield } from "lucide-react";

export default function StoreHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#e7dfd2] bg-[#f8f4ed]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6">
        <Link href="/catalogo" className="flex items-center gap-3" aria-label="4K Ternos - Catálogo">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#161713] font-serif text-lg text-[#d4ae6c]">4K</span>
          <span className="leading-none">
            <strong className="block font-serif text-lg tracking-[0.13em] text-[#1d1e1a]">TERNOS</strong>
            {!compact && <small className="text-[9px] uppercase tracking-[0.24em] text-[#8b7552]">Elegância & qualidade</small>}
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-xs font-semibold text-[#42423a] hover:bg-white sm:px-4">
            <Ruler size={16} /> <span className="hidden sm:inline">Descobrir meu tamanho</span><span className="sm:hidden">Medidas</span>
          </Link>
          <Link href="/login" aria-label="Área administrativa" className="grid h-11 w-11 place-items-center rounded-full text-[#777367] hover:bg-white"><Shield size={17} /></Link>
        </nav>
      </div>
    </header>
  );
}
