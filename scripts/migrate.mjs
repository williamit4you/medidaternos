import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL não definida");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  const directory = path.join(process.cwd(), "db", "migrations");
  const files = (await fs.readdir(directory)).filter((file) => file.endsWith(".sql")).sort();
  for (const file of files) await pool.query(await fs.readFile(path.join(directory, file), "utf8"));
  console.log(`${files.length} migração(ões) concluída(s).`);
} finally {
  await pool.end();
}
