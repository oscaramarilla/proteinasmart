import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PriorityBlock from "../../../components/protocol/PriorityBlock";
import SmartCheckList from "../../../components/protocol/SmartCheckList";
import SafetyGate from "../../../components/SafetyGate";
import WhatsappCta from "../../../components/WhatsappCta";
import { getProtocolBySlug, resolveProtocol, smartProtocols } from "../../../lib/smart-protocols";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return smartProtocols.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const protocol = getProtocolBySlug((await params).slug);
  if (!protocol) return {};
  return {
    title: `${protocol.name}: ${protocol.tagline} | ProteínaSmart`,
    description: protocol.goal,
    alternates: { canonical: `/protocolos/${protocol.slug}` },
  };
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 leading-7 text-slate-700">
          <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default async function ProtocolPage({ params }: Props) {
  const protocol = getProtocolBySlug((await params).slug);
  if (!protocol) notFound();

  const resolved = resolveProtocol(protocol);
  const base = [...resolved.required, ...resolved.conditional];
  const others = smartProtocols.filter((item) => item.id !== protocol.id);
  const contextMessage = `Hola ProteínaSmart. ${protocol.whatsappContext}`;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-14 text-slate-900">
      <nav className="text-sm text-slate-600">
        <Link className="underline" href="/protocolos">
          Protocolos
        </Link>{" "}
        / {protocol.name}
      </nav>

      <header className="mt-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Smart Protocol</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          {protocol.name}: {protocol.tagline}
        </h1>
        <p className="mt-5 text-xl leading-8 text-slate-700">{protocol.goal}</p>
        <div className="mt-8 flex flex-wrap items-start gap-4">
          <Link href="/quiz" className="rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white">
            Ver si este protocolo es el tuyo
          </Link>
          <WhatsappCta variant="secondary" label="Consultar por este protocolo" message={contextMessage} />
        </div>
      </header>

      <div className="mt-14 grid gap-10 md:grid-cols-2">
        <section>
          <h2 className="text-2xl font-bold">Para quién es</h2>
          <List items={protocol.forWho} />
        </section>
        <section>
          <h2 className="text-2xl font-bold">Para quién no es</h2>
          <List items={protocol.notForWho} />
        </section>
      </div>

      <section className="mt-14">
        <h2 className="text-2xl font-bold">Fundamento práctico</h2>
        <List items={protocol.practicalFoundation} />
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-bold">Prioridades y productos base</h2>
        <p className="mt-2 max-w-2xl leading-7 text-slate-700">
          El protocolo define prioridades; el catálogo responde. Si una prioridad no tiene una opción confirmada
          todavía, lo decimos en vez de recomendar cualquier cosa.
        </p>
        <div className="mt-6 space-y-5">
          {base.map((resolution) => (
            <PriorityBlock key={resolution.priority.key} resolution={resolution} protocolName={protocol.name} />
          ))}
        </div>
      </section>

      {resolved.optional.length > 0 ? (
        <section className="mt-14">
          <h2 className="text-2xl font-bold">Productos opcionales</h2>
          <p className="mt-2 max-w-2xl leading-7 text-slate-700">
            Nada de esto es necesario para que el protocolo funcione. Se suman de a uno y con una razón concreta.
          </p>
          <div className="mt-6 space-y-5">
            {resolved.optional.map((resolution) => (
              <PriorityBlock key={resolution.priority.key} resolution={resolution} protocolName={protocol.name} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-14">
        <h2 className="text-2xl font-bold">Lo que no recomendamos</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {protocol.redundancies.map((redundancy) => (
            <article key={redundancy.reason} className="rounded-xl border border-slate-200 p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Fuera del protocolo</p>
              <p className="mt-2 leading-7 text-slate-700">{redundancy.reason}</p>
              {resolved.redundant
                .filter((item) => item.reason === redundancy.reason)
                .map((item) => (
                  <p key={item.product.id} className="mt-2 text-sm text-slate-500">
                    Incluye: {item.product.name}
                  </p>
                ))}
            </article>
          ))}
        </div>
        <List items={protocol.avoid} />
      </section>

      <div className="mt-14 grid gap-10 md:grid-cols-2">
        <section>
          <h2 className="text-2xl font-bold">Expectativas razonables</h2>
          <List items={protocol.expectations} />
        </section>
        <section>
          <h2 className="text-2xl font-bold">Errores frecuentes</h2>
          <List items={protocol.commonMistakes} />
        </section>
      </div>

      <section className="mt-14">
        <h2 className="text-2xl font-bold">SmartCheck</h2>
        <p className="mt-2 max-w-2xl leading-7 text-slate-700">
          Después de comprar revisamos si lo pudiste sostener. Antes de reponer, revisamos si sigue teniendo sentido.
        </p>
        <div className="mt-6">
          <SmartCheckList points={protocol.smartCheck} />
        </div>
      </section>

      <div className="mt-14">
        <SafetyGate />
      </div>

      <section className="mt-14 rounded-2xl bg-slate-50 p-7">
        <h2 className="text-2xl font-bold">¿Este no es el tuyo?</h2>
        <ul className="mt-4 space-y-2">
          {others.map((item) => (
            <li key={item.id}>
              <Link className="font-semibold text-emerald-800 underline" href={`/protocolos/${item.slug}`}>
                {item.name}
              </Link>{" "}
              <span className="text-slate-700">— {item.tagline}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-12 flex flex-wrap items-start gap-4">
        <Link href="/quiz" className="rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white">
          Hacer el Smart Quiz
        </Link>
        <Link href="/catalogo" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold">
          Ver el catálogo completo
        </Link>
        <WhatsappCta
          variant="secondary"
          label="Hablar de mi caso"
          message={contextMessage}
          hint="Te respondemos con lo que tengamos confirmado, no con una lista de productos."
        />
      </div>
    </main>
  );
}
