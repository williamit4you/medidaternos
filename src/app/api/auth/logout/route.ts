import { NextResponse } from "next/server";
import { destroySession, isSameOrigin } from "@/lib/auth";

export async function POST(request: Request) {
  if (!(await isSameOrigin(request))) return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  await destroySession();
  return NextResponse.json({ ok: true });
}
