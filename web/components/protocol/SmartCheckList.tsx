import type { SmartCheckPoint } from "../../lib/smart-protocols";

export default function SmartCheckList({ points }: { points: SmartCheckPoint[] }) {
  return (
    <div>
      <ol className="space-y-4">
        {points.map((point) => (
          <li key={point.day} className="flex gap-4">
            <span className="mt-1 h-fit shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-900">
              Día {point.day}
            </span>
            <span>
              <strong className="font-semibold">{point.focus}.</strong>{" "}
              <span className="text-slate-700">{point.question}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-sm leading-6 text-slate-600">
        El SmartCheck lo hacemos por WhatsApp y solo si lo pediste. No hay reposición automática ni mensajes
        programados sin tu consentimiento.
      </p>
    </div>
  );
}
