import { ETIQUETA_PRESUPUESTO, PRESUPUESTOS, type Presupuesto } from '../../lib/quiz';
import OpcionesGrid from './OpcionesGrid';

export default function StepPresupuesto({
  valor,
  onSeleccionar,
  onVolver,
}: {
  valor: Presupuesto | null;
  onSeleccionar: (presupuesto: Presupuesto) => void;
  onVolver: () => void;
}) {
  return (
    <div className="quiz-step">
      <h1 className="quiz-titulo">¿Con qué presupuesto mensual contás?</h1>
      <p className="quiz-subtitulo">Así te recomendamos algo dentro de lo que tiene sentido gastar.</p>
      <OpcionesGrid
        opciones={PRESUPUESTOS.map((presupuesto) => ({
          valor: presupuesto,
          etiqueta: ETIQUETA_PRESUPUESTO[presupuesto],
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
