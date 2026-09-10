import { DIETAS, ETIQUETA_DIETA, type Dieta } from '../../lib/quiz';
import OpcionesGrid from './OpcionesGrid';

export default function StepDieta({
  valor,
  onSeleccionar,
  onVolver,
}: {
  valor: Dieta | null;
  onSeleccionar: (dieta: Dieta) => void;
  onVolver: () => void;
}) {
  return (
    <div className="quiz-step">
      <h1 className="quiz-titulo">¿Qué tipo de alimentación seguís?</h1>
      <p className="quiz-subtitulo">Elegí la que más se acerca a tu día a día.</p>
      <OpcionesGrid
        opciones={DIETAS.map((dieta) => ({
          valor: dieta,
          etiqueta: ETIQUETA_DIETA[dieta],
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
