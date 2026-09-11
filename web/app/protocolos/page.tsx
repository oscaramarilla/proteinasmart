import type { Metadata } from "next";
import Link from "next/link";
import SafetyGate from "../../components/SafetyGate";
import { priorityLevelLabels, smartProtocols } from "../../lib/smart-protocols";

export const metadata: Metadata = {
  title: "Smart Protocols | ProteínaSmart",
  description:
    "Cuatro protocolos de suplementación ordenados por prioridad y contexto, no por promesas. Empezá por el Smart Quiz o entrá directo al que te corresponde.",
  alternates: { canonical: "/protocolos" },
};

export default function ProtocolsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-16 text-slate-900">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Smart Protocols</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight">Elegí un protocolo, no productos sueltos</h1>
      <p className="mt-5 max-w-2xl text-xl leading-8 text-slate-700">
        Cada protocolo define prioridades. Recién después buscamos qué productos del catálogo las cumplen, y solo
        recomendamos los que tienen precio, disponibilidad y formulación confirmados.
      </p>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link href="/quiz" className="rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white">
          No sé cuál me toca: hacer el Smart Quiz
        </Link>
        <Link href="/catalogo" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold">
          Ver el catálogo
        </Link>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {smartProtocols.map((protocol) => (
          <article key={protocol.id} className="flex flex-col rounded-2xl border border-slate-200 p-7">
            <h2 className="text-2xl font-bold">{protocol.name}</h2>
            <p className="mt-2 font-medium text-emerald-800">{protocol.tagline}</p>
            <p className="mt-4 leading-7 text-slate-700">{protocol.goal}</p>

            <div className="mt-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Para quién es</p>
              <p className="mt-1 leading-7 text-slate-700">{protocol.forWho[0]}</p>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Prioridades</p>
              <ul className="mt-2 space-y-1 text-slate-700">
                {protocol.priorities.map((priority) => (
                  <li key={priority.key}>
                    {priority.label} · {priorityLevelLabels[priority.level].toLowerCase()}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              className="mt-7 inline-flex w-fit rounded-xl border border-emerald-800 px-5 py-3 font-semibold text-emerald-900"
              href={`/protocolos/${protocol.slug}`}
            >
              Ver el protocolo {protocol.name}
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-14">
        <SafetyGate />
      </div>
    </main>
  );
}
