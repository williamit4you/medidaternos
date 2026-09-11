"use client";

import { ArrowRight, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const values = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: values.get("email"), password: values.get("password") }) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) { setError(body.error || "Não foi possível entrar."); setLoading(false); return; }
    router.replace("/admin"); router.refresh();
  }
  return <form onSubmit={submit} className="mt-8 space-y-5">
    <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#79746a]">E-mail</span><span className="relative block"><Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8e877b]" /><input name="email" type="email" autoComplete="username" required className="h-14 w-full rounded-2xl border border-[#ddd5c9] bg-white pl-12 pr-4 text-[#22231e] outline-none focus:border-[#aa7b3a]" placeholder="seu@email.com" /></span></label>
    <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#79746a]">Senha</span><span className="relative block"><Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8e877b]" /><input name="password" type="password" autoComplete="current-password" required minLength={8} className="h-14 w-full rounded-2xl border border-[#ddd5c9] bg-white pl-12 pr-4 text-[#22231e] outline-none focus:border-[#aa7b3a]" placeholder="••••••••" /></span></label>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <button disabled={loading} className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#20211d] font-bold text-white disabled:opacity-60">{loading ? "Entrando..." : "Entrar no painel"}<ArrowRight size={18} /></button>
  </form>;
}
