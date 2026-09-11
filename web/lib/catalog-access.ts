// Server-only helpers. The access secret never leaves the server; the browser
// receives an expiring signature scoped to the internal catalog report.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const catalogSessionCookie = "ps_catalog_session";
export const catalogSessionMaxAge = 8 * 60 * 60;
const sessionPurpose = "catalog-report-v1";

export function isCatalogAccessConfigured(enabled?: string, secret?: string): boolean {
  return enabled === "true" && typeof secret === "string" && secret.length >= 24;
}

export function matchesCatalogSecret(candidate: unknown, secret: string): boolean {
  if (typeof candidate !== "string" || candidate.length > 512 || secret.length < 24) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(candidate), digest(secret));
}

const sign = (expires: string, secret: string) =>
  createHmac("sha256", secret).update(`${sessionPurpose}:${expires}`).digest("hex");

export function createCatalogSession(secret: string, now = Date.now()): string {
  if (secret.length < 24) throw new Error("Configurá una clave interna de al menos 24 caracteres.");
  const expires = String(Math.floor(now / 1000) + catalogSessionMaxAge);
  return `${expires}.${sign(expires, secret)}`;
}

export function hasCatalogSession(value: string | undefined, secret: string, now = Date.now()): boolean {
  if (!value || secret.length < 24) return false;
  const parts = /^(\d{10})\.([a-f0-9]{64})$/.exec(value);
  if (!parts) return false;
  const expires = Number(parts[1]);
  const current = Math.floor(now / 1000);
  if (expires <= current || expires > current + catalogSessionMaxAge) return false;
  return timingSafeEqual(Buffer.from(parts[2], "hex"), Buffer.from(sign(parts[1], secret), "hex"));
}
