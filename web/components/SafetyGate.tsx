import { negocio } from "../lib/negocio";
import WhatsappCta from "./WhatsappCta";

type Props = {
  /** "notice": el aviso dentro de un protocolo. "blocked": el resultado derivado a revisión. */
  variant?: "notice" | "blocked";
};

const flags = [
  "Embarazo o lactancia",
  "Medicación habitual o anticoagulantes",
  "Diabetes en tratamiento",
  "Condición renal o hepática diagnosticada",
  "Alergias alimentarias importantes",
];

export default function SafetyGate({ variant = "notice" }: Props) {
  if (variant === "blocked") {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-7">
        <h2 className="text-2xl font-bold text-amber-950">Preferimos que esto lo vea una persona</h2>
        <p className="mt-4 leading-7 text-amber-950">
          Marcaste algo que revisamos a mano antes de sugerir cualquier producto. No es un diagnóstico ni una
          contraindicación: es el criterio de la casa. Tampoco guardamos el detalle de lo que marcaste.
        </p>
        <p className="mt-4 leading-7 text-amber-950">
          Lo que sigue es hablarlo con tu médico o nutricionista, y si querés te ayudamos a ordenar las preguntas.
        </p>
        <div className="mt-6">
          <WhatsappCta
            message="Hola ProteínaSmart. Hice el Smart Quiz y prefiero una revisión con una persona antes de cualquier recomendación."
            label="Hablar con una persona"
          />
        </div>
        <p className="mt-6 text-sm leading-6 text-amber-900">{negocio.legal.disclaimer}</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-7">
      <h2 className="text-xl font-bold">Safety Gate</h2>
      <p className="mt-3 leading-7 text-slate-700">
        Este protocolo no se aplica de forma automática si aparece alguna de estas situaciones. En esos casos no
        recomendamos productos: derivamos a una revisión con una persona y con tu profesional de salud.
      </p>
      <ul className="mt-4 grid gap-2 text-slate-700 sm:grid-cols-2">
        {flags.map((flag) => (
          <li key={flag} className="flex gap-2">
            <span aria-hidden className="text-slate-400">
              ·
            </span>
            {flag}
          </li>
        ))}
      </ul>
      <p className="mt-5 text-sm leading-6 text-slate-600">{negocio.legal.disclaimer}</p>
    </section>
  );
}
