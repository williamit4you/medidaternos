import { Suspense } from "react";
import CatalogClient from "@/components/CatalogClient";
import StoreHeader from "@/components/StoreHeader";

export const metadata = { title: "Catálogo" };

export default function CatalogPage() {
  return <main className="min-h-screen bg-[#f8f4ed] text-[#22231e]"><StoreHeader /><Suspense fallback={<div className="p-10 text-center">Carregando catálogo...</div>}><CatalogClient /></Suspense></main>;
}
