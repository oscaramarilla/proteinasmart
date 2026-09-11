export type EvidenceLevel = "SOLID" | "EMERGING" | "MECHANISTIC";
const labels: Record<EvidenceLevel, string> = { SOLID: "Evidencia sólida", EMERGING: "Evidencia emergente", MECHANISTIC: "Mecanismo / investigación" };
export function EvidenceBadge({ level }: { level: EvidenceLevel }) { return <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{labels[level]}</span>; }
export function EvidenceNotice({ level }: { level: EvidenceLevel }) { return <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"><EvidenceBadge level={level} /> <span className="ml-2">La evidencia se interpreta según contexto; no equivale a una promesa comercial.</span></p>; }
