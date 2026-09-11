import type { Metadata } from "next";
import Link from "next/link";
import SmartProfileView from "../../../components/smart-profile/SmartProfileView";
import { buildSmartProfile, parseQuizParams } from "../../../lib/smart-quiz/profile";

// El resultado depende de los parámetros de cada persona: no se indexa.
export const metadata: Metadata = {
  title: "Tu Smart Profile | ProteínaSmart",
  description: "El resultado del Smart Quiz: protocolo, prioridades y qué confirmar antes de comprar.",
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function QuizResultPage({ searchParams }: Props) {
  const input = parseQuizParams(await searchParams);

  if (!input) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-6 py-16 text-slate-900">
        <h1 className="text-3xl font-bold">Volvé a completar el Smart Quiz</h1>
        <p className="mt-4 leading-7 text-slate-700">
          Nos faltan tus respuestas para armar el perfil. Son seis preguntas y no guardamos datos de salud.
        </p>
        <Link href="/quiz" className="mt-6 inline-flex rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white">
          Hacer el Smart Quiz
        </Link>
      </main>
    );
  }

  return <SmartProfileView profile={buildSmartProfile(input)} />;
}
