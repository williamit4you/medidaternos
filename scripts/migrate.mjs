import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL não definida");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  const file = path.join(process.cwd(), "db", "migrations", "001_init.sql");
  await pool.query(await fs.readFile(file, "utf8"));
  console.log("Migração concluída.");
} finally {
  await pool.end();
}
