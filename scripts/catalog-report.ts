import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { renderCatalogChecklist } from "../web/lib/catalog-report.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const requested = process.argv.slice(2).filter((argument) => argument !== "--");
if (requested.length > 1) throw new Error("Uso: node --experimental-strip-types scripts/catalog-report.ts [ruta.md]");
const destination = resolve(root, requested[0] ?? "docs/CATALOG_COMPLETENESS.md");
await mkdir(dirname(destination), { recursive: true });
await writeFile(destination, renderCatalogChecklist(), "utf8");
console.log(`Checklist generado: ${destination}`);
