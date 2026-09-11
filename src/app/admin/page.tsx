import AdminDashboard from "@/components/AdminDashboard";
import { requirePageSession } from "@/lib/auth";

export const metadata = { title: "Administração", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await requirePageSession();
  return <AdminDashboard email={session.email} />;
}
