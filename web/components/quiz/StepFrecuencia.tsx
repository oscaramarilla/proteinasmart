import { ETIQUETA_FRECUENCIA, FRECUENCIAS, type Frecuencia } from '../../lib/quiz';
import OpcionesGrid from './OpcionesGrid';

export default function StepFrecuencia({
  valor,
  onSeleccionar,
  onVolver,
}: {
  valor: Frecuencia | null;
  onSeleccionar: (frecuencia: Frecuencia) => void;
  onVolver: () => void;
}) {
  return (
    <div className="quiz-step">
      <h1 className="quiz-titulo">¿Con qué frecuencia entrenás?</h1>
      <p className="quiz-subtitulo">Así ajustamos la recomendación a tu rutina real.</p>
      <OpcionesGrid
        opciones={FRECUENCIAS.map((frecuencia) => ({
          valor: frecuencia,
          etiqueta: ETIQUETA_FRECUENCIA[frecuencia],
        }))}
        seleccionado={valor}
        onSeleccionar={onSeleccionar}
      />
      <button type="button" onClick={onVolver} className="quiz-volver">
        ← Volver
      </button>
    </div>
  );
}
