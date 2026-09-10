import { ETIQUETA_OBJETIVO, OBJETIVOS, type Objetivo } from '../../lib/quiz';
import OpcionesGrid from './OpcionesGrid';

export default function StepObjetivo({
  valor,
  onSeleccionar,
}: {
  valor: Objetivo | null;
  onSeleccionar: (objetivo: Objetivo) => void;
}) {
  return (
    <div className="quiz-step">
      <h1 className="quiz-titulo">¿Cuál es tu objetivo?</h1>
      <p className="quiz-subtitulo">Elegí el que mejor te describe hoy.</p>
      <OpcionesGrid
        opciones={OBJETIVOS.map((objetivo) => ({
          valor: objetivo,
          etiqueta: ETIQUETA_OBJETIVO[objetivo],
        }))}
        seleccionado={valor}
        onSeleccionar={onSeleccionar}
      />
    </div>
  );
}
