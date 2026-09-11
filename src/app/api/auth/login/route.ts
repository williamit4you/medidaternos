import { compare } from "bcryptjs";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createSession, isSameOrigin } from "@/lib/auth";
import { query } from "@/lib/db";
import { loginSchema } from "@/lib/validation";

const DUMMY_HASH = "$2b$12$KIXQ4hLrjA6l7N1E4GO2WuTwUpX2JmKT9LzN7zxqRraxfcnAqkGdS";

export async function POST(request: Request) {
  if (!(await isSameOrigin(request))) return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 400 });
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipHash = createHash("sha256").update(`${forwarded}:${process.env.JWT_SECRET || ""}`).digest("hex");
  const attempts = await query<{ count: string }>(`
    SELECT COUNT(*)::text AS count FROM login_attempts
    WHERE email = $1 AND ip_hash = $2 AND succeeded = FALSE AND created_at > NOW() - INTERVAL '15 minutes'`, [parsed.data.email, ipHash]);
  if (Number(attempts.rows[0]?.count || 0) >= 8) return NextResponse.json({ error: "Muitas tentativas. Aguarde 15 minutos." }, { status: 429 });

  const userResult = await query<{ id: string; email: string; password_hash: string; role: "ADMIN" }>("SELECT id, email, password_hash, role FROM users WHERE email = $1", [parsed.data.email]);
  const user = userResult.rows[0];
  const valid = await compare(parsed.data.password, user?.password_hash || DUMMY_HASH);
  await query("INSERT INTO login_attempts (email, ip_hash, succeeded) VALUES ($1, $2, $3)", [parsed.data.email, ipHash, Boolean(user && valid)]);
  if (!user || !valid) return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  await createSession({ userId: user.id, email: user.email, role: user.role });
  return NextResponse.json({ ok: true });
}
