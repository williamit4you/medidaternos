import { z } from "zod";

export const loginSchema = z.object({
  email: z.email().max(254).transform((value) => value.toLowerCase().trim()),
  password: z.string().min(8).max(128),
});

export const productSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(5000),
  categoryId: z.uuid(),
  priceCents: z.number().int().min(0).max(100_000_000),
  installments: z.number().int().min(1).max(24),
  sizes: z.array(z.string().trim().min(1).max(12)).min(1, "Selecione ao menos um tamanho.").max(30).transform((sizes) => [...new Set(sizes)]),
  active: z.boolean().default(true),
});

export const categorySchema = z.object({ name: z.string().trim().min(2).max(60) });
