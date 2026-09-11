import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { getSession } from "@/lib/auth";

export const metadata = { title: "Login" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  return <main className="grid min-h-screen bg-[#f3eee6] md:grid-cols-2"><section className="hidden bg-[#1c1d19] p-12 text-white md:flex md:flex-col md:justify-between"><div className="font-serif text-2xl tracking-[.18em] text-[#d8b170]">4K TERNOS</div><div><p className="max-w-md font-serif text-5xl leading-tight">Curadoria e presença em cada detalhe.</p><p className="mt-5 max-w-sm text-sm leading-6 text-white/55">Gerencie seu catálogo, preços, categorias e imagens em um só lugar.</p></div><small className="text-white/35">Painel administrativo seguro</small></section><section className="flex items-center justify-center p-5 sm:p-10"><div className="w-full max-w-md"><Link href="/catalogo" className="mb-10 inline-flex min-h-11 items-center gap-2 text-sm text-[#69655c]"><ArrowLeft size={17} /> Voltar ao catálogo</Link><div className="rounded-[28px] border border-[#e1d9cd] bg-[#faf7f2] p-6 shadow-[0_20px_60px_rgba(44,34,19,.08)] sm:p-9"><div className="mb-8 flex items-center gap-3 md:hidden"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#1c1d19] font-serif text-[#d8b170]">4K</span><strong className="font-serif tracking-[.15em]">TERNOS</strong></div><span className="text-[10px] font-bold uppercase tracking-[.28em] text-[#9b733b]">Acesso restrito</span><h1 className="mt-3 font-serif text-4xl text-[#22231e]">Bem-vindo</h1><p className="mt-2 text-sm text-[#777166]">Entre para atualizar a coleção da loja.</p><LoginForm /></div></div></section></main>;
}
