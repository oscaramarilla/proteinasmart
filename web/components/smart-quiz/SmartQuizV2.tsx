"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Frequency, Goal } from "../../lib/smart-quiz/engine";

type Answers = { goal?: Goal; frequency?: Frequency; trainingMonths?: number; structuredRoutine?: boolean; budget?: number; safetyRedFlag?: boolean };
const options = { goal: [["MASS", "Ganar masa muscular"], ["CUT", "Reducir grasa / mejorar composición corporal"], ["PERFORMANCE", "Rendimiento y energía"], ["LONGEVITY", "Salud, fuerza y longevidad"]], frequency: [["LOW", "0–2 veces"], ["MEDIUM", "3–4 veces"], ["HIGH", "5+ veces"]] } as const;
export default function SmartQuizV2() {
  const router = useRouter(); const [step, setStep] = useState(0); const [answers, setAnswers] = useState<Answers>({});
  const next = (value: Partial<Answers>) => { const updated = { ...answers, ...value }; setAnswers(updated); if (step < 5) setStep(step + 1); else { const p = new URLSearchParams({ goal: updated.goal!, frequency: updated.frequency!, months: String(updated.trainingMonths ?? 0), structured: String(updated.structuredRoutine), budget: String(updated.budget ?? 0), safety: String(updated.safetyRedFlag) }); router.push(`/quiz/resultado?${p}`); } };
  const choices = step === 0 ? options.goal : options.frequency;
  return <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-12 text-slate-900"><p className="text-sm font-semibold text-emerald-700">Smart Quiz · {step + 1} de 6</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-emerald-700" style={{ width: `${((step + 1) / 6) * 100}%` }} /></div>
    {step < 2 && <section className="mt-9"><h1 className="text-3xl font-bold">{step === 0 ? "¿Cuál es tu objetivo?" : "¿Cuántas veces entrenás por semana?"}</h1><p className="mt-3 text-slate-600">Elegí la opción que mejor describe tu situación hoy.</p><div className="mt-7 grid gap-3">{choices.map(([value, label]) => <button key={value} onClick={() => next(step === 0 ? { goal: value as Goal } : { frequency: value as Frequency })} className="rounded-xl border border-slate-300 p-4 text-left font-semibold hover:border-emerald-700 hover:bg-emerald-50">{label}</button>)}</div></section>}
    {step === 2 && <Choice title="¿Hace cuánto entrenás?" options={[[0, "Estoy empezando"], [3, "Menos de 6 meses"], [9, "6–12 meses"], [12, "Más de un año"]]} onChoose={(trainingMonths) => next({ trainingMonths })} />}
    {step === 3 && <Choice title="¿Seguís una rutina estructurada y registrás tu progreso?" options={[[true, "Sí"], [false, "No"]]} onChoose={(structuredRoutine) => next({ structuredRoutine })} />}
    {step === 4 && <Choice title="¿Con qué presupuesto contás?" options={[[300000, "Essential · hasta Gs. 300.000"], [500000, "Lite · Gs. 301.000–500.000"], [700000, "Core · Gs. 501.000–700.000"], [700001, "Full · más de Gs. 700.000"]]} onChoose={(budget) => next({ budget })} />}
    {step === 5 && <Choice title="Seguridad primero" description="¿Hay embarazo/lactancia, enfermedad renal o hepática relevante, medicación habitual, diabetes medicada, anticoagulantes, alergias importantes u otra condición para revisar? No guardamos detalles clínicos." options={[[true, "Sí, prefiero revisión"], [false, "No"]]} onChoose={(safetyRedFlag) => next({ safetyRedFlag })} />}
  </main>;
}
function Choice<T extends string | number | boolean>({ title, description, options, onChoose }: { title: string; description?: string; options: readonly (readonly [T, string])[]; onChoose: (value: T) => void }) { return <section className="mt-9"><h1 className="text-3xl font-bold">{title}</h1>{description && <p className="mt-3 leading-7 text-slate-600">{description}</p>}<div className="mt-7 grid gap-3">{options.map(([value, label]) => <button key={String(value)} onClick={() => onChoose(value)} className="rounded-xl border border-slate-300 p-4 text-left font-semibold hover:border-emerald-700 hover:bg-emerald-50">{label}</button>)}</div></section>; }
