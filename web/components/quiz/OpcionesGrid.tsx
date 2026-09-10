type Opcion<T extends string> = { valor: T; etiqueta: string };

export default function OpcionesGrid<T extends string>({
  opciones,
  seleccionado,
  onSeleccionar,
}: {
  opciones: Opcion<T>[];
  seleccionado: T | null;
  onSeleccionar: (valor: T) => void;
}) {
  return (
    <div className="quiz-opciones">
      {opciones.map((opcion) => (
        <button
          key={opcion.valor}
          type="button"
          onClick={() => onSeleccionar(opcion.valor)}
          className={`quiz-opcion ${seleccionado === opcion.valor ? 'quiz-opcion-activa' : ''}`}
          aria-pressed={seleccionado === opcion.valor}
        >
          {opcion.etiqueta}
        </button>
      ))}
    </div>
  );
}
