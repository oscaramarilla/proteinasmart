import {
  ETIQUETA_OBJETIVO,
  type Dieta,
  type Frecuencia,
  type Objetivo,
  type Presupuesto,
} from '../../lib/quiz';

type Props = {
  formAction: (formData: FormData) => void;
  pending: boolean;
  error?: string;
  respuestas: {
    objetivo: Objetivo;
    frecuencia: Frecuencia;
    dieta: Dieta;
    presupuesto: Presupuesto;
  };
  onVolver: () => void;
};

export default function StepWhatsapp({ formAction, pending, error, respuestas, onVolver }: Props) {
  return (
    <form action={formAction} className="quiz-step">
      <h1 className="quiz-titulo">¿A qué WhatsApp te enviamos tu protocolo gratis?</h1>
      <p className="quiz-subtitulo">
        Con {ETIQUETA_OBJETIVO[respuestas.objetivo].toLowerCase()} como objetivo, te armamos una
        recomendación en minutos.
      </p>

      <input type="hidden" name="objetivo" value={respuestas.objetivo} />
      <input type="hidden" name="frecuencia" value={respuestas.frecuencia} />
      <input type="hidden" name="dieta" value={respuestas.dieta} />
      <input type="hidden" name="presupuesto" value={respuestas.presupuesto} />

      <label className="quiz-label" htmlFor="quiz-whatsapp">
        <span>WhatsApp</span>
        <input
          id="quiz-whatsapp"
          type="tel"
          name="whatsapp"
          placeholder="0985 864 209"
          required
          minLength={8}
          className="quiz-input"
        />
      </label>
      {error && <p className="quiz-error">{error}</p>}

      <div className="quiz-nav">
        <button type="button" onClick={onVolver} className="quiz-volver">
          ← Volver
        </button>
        <button type="submit" disabled={pending} className="quiz-cta">
          {pending ? 'Enviando...' : 'Quiero mi protocolo gratis'}
        </button>
      </div>
    </form>
  );
}
