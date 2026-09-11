import Link from "next/link";
import type { SmartProfile } from "../../lib/smart-quiz/profile";
import { buildProfileWhatsAppMessage } from "../../lib/smart-quiz/profile";
import PriorityBlock from "../protocol/PriorityBlock";
import SmartCheckList from "../protocol/SmartCheckList";
import SafetyGate from "../SafetyGate";
import WhatsappCta from "../WhatsappCta";

function Summary({ profile }: { profile: SmartProfile }) {
  const rows: Array<[string, string]> = [
    ["Objetivo", profile.goalLabel],
    ["Frecuencia", profile.frequencyLabel],
    ["Experiencia", profile.experienceLabel],
    ["Rutina estructurada", profile.structuredRoutine ? "Sí" : "Todavía no"],
    ["Protocolo", profile.protocol?.name ?? "Pendiente de revisión"],
    ["Nivel", profile.tierLabel],
  ];
  return (
    <dl className="mt-8 grid gap-5 rounded-2xl bg-slate-50 p-6 sm:grid-cols-3">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-sm text-slate-500">{label}</dt>
          <dd className="mt-1 font-semibold text-slate-900">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function SmartProfileView({ profile }: { profile: SmartProfile }) {
  const { protocol } = profile;

  if (profile.safetyStatus === "REVIEW_REQUIRED" || !protocol) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-16 text-slate-900">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Tu Smart Profile</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Tu resultado necesita una revisión</h1>
        <Summary profile={profile} />
        <div className="mt-10">
          <SafetyGate variant="blocked" />
        </div>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/protocolos" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold">
            Ver los protocolos igual
          </Link>
          <Link href="/quiz" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold">
            Rehacer el Smart Quiz
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16 text-slate-900">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Tu Smart Profile</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">
        {protocol.name} · nivel {profile.tier}
      </h1>
      <p className="mt-4 max-w-2xl text-xl leading-8 text-slate-700">{protocol.goal}</p>

      <Summary profile={profile} />

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Tus prioridades, en orden</h2>
        <p className="mt-2 max-w-2xl leading-7 text-slate-700">
          Primero lo base, después lo que depende de tu contexto. Cada prioridad se resuelve con productos del
          catálogo, no al revés.
        </p>
        <div className="mt-6 space-y-5">
          {profile.suggested.map((resolution) => (
            <PriorityBlock key={resolution.priority.key} resolution={resolution} protocolName={protocol.name} contextual />
          ))}
        </div>
      </section>

      {profile.optional.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-2xl font-bold">Opcionales, solo si el contexto lo justifica</h2>
          <div className="mt-6 space-y-5">
            {profile.optional.map((resolution) => (
              <PriorityBlock key={resolution.priority.key} resolution={resolution} protocolName={protocol.name} contextual />
            ))}
          </div>
        </section>
      ) : null}

      {profile.later.length > 0 ? (
        <section className="mt-12 rounded-2xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold">Para más adelante</h2>
          <p className="mt-2 leading-7 text-slate-700">{profile.tierNote}</p>
          <ul className="mt-4 space-y-3">
            {profile.later.map((resolution) => (
              <li key={resolution.priority.key} className="text-slate-700">
                <strong className="font-semibold text-slate-900">{resolution.priority.label}.</strong>{" "}
                {resolution.priority.reason}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Lo que no recomendamos</h2>
        <ul className="mt-5 grid gap-4 md:grid-cols-2">
          {profile.avoid.map((item) => (
            <li key={item.reason} className="rounded-xl border border-slate-200 p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
              <p className="mt-2 leading-7 text-slate-700">{item.reason}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded-2xl bg-slate-50 p-7">
        <h2 className="text-2xl font-bold">Por qué te decimos esto</h2>
        <dl className="mt-5 space-y-4">
          {profile.decisions.map((decision) => (
            <div key={decision.title}>
              <dt className="font-semibold text-slate-900">{decision.title}</dt>
              <dd className="mt-1 leading-7 text-slate-700">{decision.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">SmartCheck: qué revisamos después</h2>
        <div className="mt-5">
          <SmartCheckList points={protocol.smartCheck} />
        </div>
      </section>

      <div className="mt-12">
        <SafetyGate />
      </div>

      <div className="mt-12 flex flex-wrap items-start gap-4">
        <WhatsappCta
          label="Enviar mi Smart Profile por WhatsApp"
          message={buildProfileWhatsAppMessage(profile)}
          hint="El mensaje lleva objetivo, entrenamiento y protocolo. No incluye respuestas de salud."
        />
        <Link
          href={`/protocolos/${protocol.slug}`}
          className="rounded-xl border border-emerald-800 px-5 py-3 font-semibold text-emerald-900"
        >
          Ver el protocolo completo
        </Link>
        <Link href="/quiz" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700">
          Rehacer el Quiz
        </Link>
      </div>
    </main>
  );
}
