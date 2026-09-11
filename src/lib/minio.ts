import { Client } from "minio";

let client: Client | undefined;

export function minio() {
  if (client) return client;
  const rawUrl = process.env.MINIO_SERVER_URL;
  const accessKey = process.env.MINIO_ROOT_USER;
  const secretKey = process.env.MINIO_ROOT_PASSWORD;
  if (!rawUrl || !accessKey || !secretKey) throw new Error("Configuração MinIO incompleta");
  const endpoint = new URL(rawUrl);
  client = new Client({
    endPoint: endpoint.hostname,
    port: endpoint.port ? Number(endpoint.port) : endpoint.protocol === "https:" ? 443 : 80,
    useSSL: endpoint.protocol === "https:",
    accessKey,
    secretKey,
  });
  return client;
}

export const MINIO_BUCKET = process.env.MINIO_BUCKET || "ternos";
