import pg from "pg";
import { hash } from "bcryptjs";

const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || "Administrador 4K Ternos";

if (!process.env.DATABASE_URL || !email || !password) {
  throw new Error("DATABASE_URL, ADMIN_EMAIL e ADMIN_PASSWORD são obrigatórias.");
}
if (password.length < 8) throw new Error("ADMIN_PASSWORD deve ter ao menos 8 caracteres.");

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  const passwordHash = await hash(password, 12);
  await pool.query(`
    INSERT INTO users (email, password_hash, name, role)
    VALUES ($1, $2, $3, 'ADMIN')
    ON CONFLICT (email) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      name = EXCLUDED.name,
      role = 'ADMIN',
      updated_at = NOW()`, [email, passwordHash, name]);
  console.log("Usuário administrativo criado ou atualizado.");
} finally {
  await pool.end();
}
