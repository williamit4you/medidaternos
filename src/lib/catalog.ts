import { query } from "./db";

export type CatalogImage = { id: string; altText: string; url: string };
export type CatalogProduct = {
  id: string;
  title: string;
  slug: string;
  description: string;
  priceCents: number;
  installments: number;
  sizes: string[];
  active: boolean;
  category: { id: string; name: string; slug: string };
  images: CatalogImage[];
};

type ProductRow = {
  id: string; title: string; slug: string; description: string; price_cents: number;
  installments: number; sizes: string[]; active: boolean; category_id: string; category_name: string;
  category_slug: string; images: unknown;
};

function mapProduct(row: ProductRow): CatalogProduct {
  const raw = Array.isArray(row.images) ? row.images : [];
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    priceCents: row.price_cents,
    installments: row.installments,
    sizes: row.sizes || [],
    active: row.active,
    category: { id: row.category_id, name: row.category_name, slug: row.category_slug },
    images: raw.map((item) => {
      const image = item as { id: string; altText: string };
      return { ...image, url: `/api/images/${image.id}` };
    }),
  };
}

const productSelect = `
  SELECT p.id, p.title, p.slug, p.description, p.price_cents, p.installments, p.sizes, p.active,
    c.id AS category_id, c.name AS category_name, c.slug AS category_slug,
    COALESCE(json_agg(json_build_object('id', i.id, 'altText', i.alt_text) ORDER BY i.sort_order)
      FILTER (WHERE i.id IS NOT NULL), '[]') AS images
  FROM products p
  JOIN categories c ON c.id = p.category_id
  LEFT JOIN product_images i ON i.product_id = p.id`;

export async function getCatalog(options: { page: number; perPage: number; category?: string; search?: string; includeInactive?: boolean }) {
  const conditions = options.includeInactive ? [] : ["p.active = TRUE"];
  const values: unknown[] = [];
  if (options.category) {
    values.push(options.category);
    conditions.push(`c.slug = $${values.length}`);
  }
  if (options.search) {
    values.push(`%${options.search}%`);
    conditions.push(`(p.title ILIKE $${values.length} OR p.description ILIKE $${values.length} OR c.name ILIKE $${values.length})`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const countResult = await query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM products p JOIN categories c ON c.id = p.category_id ${where}`, values);
  const total = Number(countResult.rows[0]?.count || 0);
  values.push(options.perPage, (options.page - 1) * options.perPage);
  const result = await query<ProductRow>(`${productSelect} ${where} GROUP BY p.id, c.id ORDER BY p.created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`, values);
  return { products: result.rows.map(mapProduct), total, page: options.page, perPage: options.perPage, pages: Math.max(1, Math.ceil(total / options.perPage)) };
}

export async function getProductBySlug(slug: string, includeInactive = false) {
  const result = await query<ProductRow>(`${productSelect} WHERE p.slug = $1 ${includeInactive ? "" : "AND p.active = TRUE"} GROUP BY p.id, c.id LIMIT 1`, [slug]);
  return result.rows[0] ? mapProduct(result.rows[0]) : null;
}

export async function getProductById(id: string) {
  const result = await query<ProductRow>(`${productSelect} WHERE p.id = $1 GROUP BY p.id, c.id LIMIT 1`, [id]);
  return result.rows[0] ? mapProduct(result.rows[0]) : null;
}

export async function getCategories() {
  const result = await query<{ id: string; name: string; slug: string; product_count: string }>(`
    SELECT c.id, c.name, c.slug, COUNT(p.id) FILTER (WHERE p.active = TRUE)::text AS product_count
    FROM categories c LEFT JOIN products p ON p.category_id = c.id GROUP BY c.id ORDER BY c.name`);
  return result.rows.map((row) => ({ ...row, productCount: Number(row.product_count) }));
}
