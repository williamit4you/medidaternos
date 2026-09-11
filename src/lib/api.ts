import { NextResponse } from "next/server";
import { isSameOrigin, requireApiSession } from "./auth";

export async function authorizeMutation(request: Request) {
  if (!(await requireApiSession())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  if (!(await isSameOrigin(request))) return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  return null;
}

export async function authorizeRead() {
  if (!(await requireApiSession())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  return null;
}
