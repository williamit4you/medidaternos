import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "4k_admin_session";
const lifetimeSeconds = 60 * 60 * 8;

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32) throw new Error("JWT_SECRET deve ter ao menos 32 caracteres");
  return new TextEncoder().encode(value);
}

export type Session = { userId: string; email: string; role: "ADMIN" };

export async function createSession(session: Session) {
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${lifetimeSeconds}s`)
    .setIssuer("4k-ternos")
    .setAudience("4k-admin")
    .sign(secret());
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: lifetimeSeconds,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { issuer: "4k-ternos", audience: "4k-admin" });
    if (payload.role !== "ADMIN" || typeof payload.userId !== "string" || typeof payload.email !== "string") return null;
    return { userId: payload.userId, email: payload.email, role: "ADMIN" };
  } catch {
    return null;
  }
}

export async function requirePageSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireApiSession() {
  const session = await getSession();
  if (!session) return null;
  return session;
}

export async function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = (await headers()).get("x-forwarded-host") || (await headers()).get("host");
  const protocol = (await headers()).get("x-forwarded-proto") || (process.env.NODE_ENV === "production" ? "https" : "http");
  return origin === `${protocol}://${host}`;
}
