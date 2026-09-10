'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { enviarQuizLead } from '../../app/actions';
import { estadoInicialQuizLead, type Dieta, type Frecuencia, type Objetivo, type Presupuesto } from '../../lib/quiz';
import StepDieta from './StepDieta';
import StepFrecuencia from './StepFrecuencia';
import StepObjetivo from './StepObjetivo';
import StepPresupuesto from './StepPresupuesto';
import StepWhatsapp from './StepWhatsapp';

type Respuestas = {
  objetivo: Objetivo | null;
  frecuencia: Frecuencia | null;
  dieta: Dieta | null;
  presupuesto: Presupuesto | null;
};

const TOTAL_PASOS = 5;

export default function SmartQuiz() {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [respuestas, setRespuestas] = useState<Respuestas>({
    objetivo: null,
    frecuencia: null,
    dieta: null,
    presupuesto: null,
  });
  const [state, formAction, pending] = useActionState(enviarQuizLead, estadoInicialQuizLead);

  useEffect(() => {
    if (state.status === 'success' && state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state, router]);

  function avanzar() {
    setPaso((actual) => Math.min(actual + 1, TOTAL_PASOS));
  }

  function retroceder() {
    setPaso((actual) => Math.max(actual - 1, 1));
  }

  return (
    <main className="quiz-shell min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
        <div className="quiz-progress" aria-hidden="true">
          <div className="quiz-progress-bar" style={{ width: `${(paso / TOTAL_PASOS) * 100}%` }} />
        </div>
        <p className="quiz-eyebrow">
          Paso {paso} de {TOTAL_PASOS}
        </p>

        {paso === 1 && (
          <StepObjetivo
            valor={respuestas.objetivo}
            onSeleccionar={(objetivo) => {
              setRespuestas((previas) => ({ ...previas, objetivo }));
              avanzar();
            }}
          />
        )}

        {paso === 2 && (
          <StepFrecuencia
            valor={respuestas.frecuencia}
            onSeleccionar={(frecuencia) => {
              setRespuestas((previas) => ({ ...previas, frecuencia }));
              avanzar();
            }}
            onVolver={retroceder}
          />
        )}

        {paso === 3 && (
          <StepDieta
            valor={respuestas.dieta}
            onSeleccionar={(dieta) => {
              setRespuestas((previas) => ({ ...previas, dieta }));
              avanzar();
            }}
            onVolver={retroceder}
          />
        )}

        {paso === 4 && (
          <StepPresupuesto
            valor={respuestas.presupuesto}
            onSeleccionar={(presupuesto) => {
              setRespuestas((previas) => ({ ...previas, presupuesto }));
              avanzar();
            }}
            onVolver={retroceder}
          />
        )}

        {paso === 5 &&
          respuestas.objetivo &&
          respuestas.frecuencia &&
          respuestas.dieta &&
          respuestas.presupuesto && (
            <StepWhatsapp
              formAction={formAction}
              pending={pending}
              error={state.status === 'error' ? state.error : undefined}
              respuestas={{
                objetivo: respuestas.objetivo,
                frecuencia: respuestas.frecuencia,
                dieta: respuestas.dieta,
                presupuesto: respuestas.presupuesto,
              }}
              onVolver={retroceder}
            />
          )}
      </div>
    </main>
  );
}
