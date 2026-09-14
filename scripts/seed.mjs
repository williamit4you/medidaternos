import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { hash } from "bcryptjs";
import { Client as MinioClient } from "minio";

const required = ["DATABASE_URL", "INITIAL_ADMIN_EMAIL", "INITIAL_ADMIN_PASSWORD", "MINIO_SERVER_URL", "MINIO_ROOT_USER", "MINIO_ROOT_PASSWORD"];
for (const key of required) if (!process.env[key]) throw new Error(`${key} não definida`);
if (process.env.INITIAL_ADMIN_PASSWORD.length < 8) throw new Error("INITIAL_ADMIN_PASSWORD deve ter ao menos 8 caracteres");
const database = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const endpoint = new URL(process.env.MINIO_SERVER_URL);
const storage = new MinioClient({ endPoint: endpoint.hostname, port: endpoint.port ? Number(endpoint.port) : endpoint.protocol === "https:" ? 443 : 80, useSSL: endpoint.protocol === "https:", accessKey: process.env.MINIO_ROOT_USER, secretKey: process.env.MINIO_ROOT_PASSWORD });
const bucket = process.env.MINIO_BUCKET || "ternos";
const categories = [["Clássicos", "classicos"], ["Slim Fit", "slim-fit"], ["Casamentos", "casamentos"], ["Verão", "verao"]];
const products = [
  { category: "classicos", title: "Terno Chumbo Príncipe de Gales", slug: "terno-chumbo-principe-de-gales", description: "Terno em tecido premium chumbo com padronagem xadrez discreta. Corte alinhado, ombros estruturados e acabamento preciso para reuniões, formaturas e cerimônias. Acompanha paletó e calça.", price: 69900, installments: 5, sizes: ["40", "42", "44", "46", "48"], image: "terno-chumbo.png" },
  { category: "classicos", title: "Terno Azul Marinho Essencial", slug: "terno-azul-marinho-essencial", description: "Um clássico versátil em azul-marinho profundo. Modelagem elegante, construção confortável e tecido de toque macio. Ideal para o trabalho, eventos noturnos e ocasiões formais.", price: 74900, installments: 6, sizes: ["38", "40", "42", "44", "46"], image: "terno-marinho.png" },
  { category: "slim-fit", title: "Terno Preto Slim Signature", slug: "terno-preto-slim-signature", description: "Visual contemporâneo com linhas limpas e caimento slim. O preto intenso valoriza a silhueta e cria uma opção marcante para festas, celebrações e produções monocromáticas.", price: 79900, installments: 8, sizes: ["40", "42", "44", "46"], image: "terno-preto.png" },
  { category: "verao", title: "Terno Bege Riviera", slug: "terno-bege-riviera", description: "Leveza e sofisticação para dias claros. O tom bege e a textura inspirada no linho entregam frescor, conforto e presença em casamentos diurnos e eventos ao ar livre.", price: 84900, installments: 8, sizes: ["38", "40", "42", "44"], image: "terno-bege.png" },
  { category: "casamentos", title: "Terno Grafite Três Peças", slug: "terno-grafite-tres-pecas", description: "Conjunto completo com paletó, colete e calça em grafite. Acabamento refinado e proporções equilibradas para noivos, padrinhos e ocasiões que pedem máxima elegância.", price: 99900, installments: 10, sizes: ["42", "44", "46", "48", "50"], image: "terno-tres-pecas.png" },
];
try {
  if (!(await storage.bucketExists(bucket))) await storage.makeBucket(bucket);
  for (const [name, slug] of categories) await database.query("INSERT INTO categories (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name", [name, slug]);
  const passwordHash = await hash(process.env.INITIAL_ADMIN_PASSWORD, 12);
  await database.query(`INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, 'Willian Barata', 'ADMIN') ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash, updated_at=NOW()`, [process.env.INITIAL_ADMIN_EMAIL.toLowerCase(), passwordHash]);
  for (const item of products) {
    const result = await database.query(`INSERT INTO products (category_id, title, slug, description, price_cents, installments, sizes, active) VALUES ((SELECT id FROM categories WHERE slug=$1), $2, $3, $4, $5, $6, $7, TRUE) ON CONFLICT (slug) DO UPDATE SET category_id=EXCLUDED.category_id, title=EXCLUDED.title, description=EXCLUDED.description, price_cents=EXCLUDED.price_cents, installments=EXCLUDED.installments, sizes=EXCLUDED.sizes, updated_at=NOW() RETURNING id`, [item.category, item.title, item.slug, item.description, item.price, item.installments, item.sizes]);
    const productId = result.rows[0].id;
    const key = `produtos/${productId}/principal.png`;
    const image = await fs.readFile(path.join(process.cwd(), "seed-assets", item.image));
    await storage.putObject(bucket, key, image, image.length, { "Content-Type": "image/png" });
    await database.query(`INSERT INTO product_images (product_id, object_key, alt_text, sort_order, mime_type) VALUES ($1, $2, $3, 0, 'image/png') ON CONFLICT (object_key) DO UPDATE SET alt_text=EXCLUDED.alt_text`, [productId, key, item.title]);
  }
  console.log("Seed concluído: administrador, categorias, cinco produtos e imagens.");
} finally { await database.end(); }
