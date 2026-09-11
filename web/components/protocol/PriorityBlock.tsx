import Link from "next/link";
import { priorityLevelLabels, type PriorityResolution } from "../../lib/smart-protocols";
import RecommendedProducts from "../product/RecommendedProducts";
import WhatsappCta from "../WhatsappCta";

const levelStyles: Record<string, string> = {
  required: "bg-emerald-100 text-emerald-900",
  conditional: "bg-sky-100 text-sky-900",
  optional: "bg-slate-100 text-slate-700",
};

type Props = {
  resolution: PriorityResolution;
  protocolName: string;
  /** `true` cuando ya hay contexto individual (viene del Quiz con Safety Gate pasado). */
  contextual?: boolean;
};

export default function PriorityBlock({ resolution, protocolName, contextual = false }: Props) {
  const { priority, products } = resolution;
  return (
    <article className="rounded-2xl border border-slate-200 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-xl font-bold">{priority.label}</h3>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${levelStyles[priority.level]}`}>
          {priorityLevelLabels[priority.level]}
        </span>
      </div>
      {priority.condition ? (
        <p className="mt-3 leading-7 text-slate-700">
          <strong className="font-semibold">Cuándo aplica:</strong> {priority.condition}
        </p>
      ) : null}
      <p className="mt-2 leading-7 text-slate-700">{priority.reason}</p>

      <div className="mt-6">
        {products.length > 0 ? (
          <RecommendedProducts
            level={3}
            title="Opciones del catálogo que la cumplen"
            products={products}
            description="Precio, disponibilidad y formulación confirmados. Igual revisamos la etiqueta con vos antes de cobrar."
          />
        ) : (
          <div className="rounded-xl bg-slate-50 p-5">
            <p className="leading-7 text-slate-700">
              {contextual
                ? "Todavía no tenemos una opción habilitada para esta prioridad. Solo recomendamos fichas con precio, disponibilidad, formulación y autenticidad confirmados: esta se resuelve a mano."
                : "Qué producto la cumple depende de tu contexto, así que no lo resolvemos desde una página pública. Hacelo con el Smart Quiz o preguntanos directamente."}
            </p>
            <div className="mt-4 flex flex-wrap items-start gap-3">
              {contextual ? null : (
                <Link href="/quiz" className="rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white">
                  Hacer el Smart Quiz
                </Link>
              )}
              <WhatsappCta
                variant="secondary"
                label="Preguntar por esta prioridad"
                message={`Hola ProteínaSmart. En el protocolo ${protocolName} me interesa la prioridad "${priority.label}". ¿Qué opción tenés confirmada hoy?`}
              />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
