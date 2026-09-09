// A partir de este umbral (el mínimo habitual para conservar la regularidad) la
// asistencia se destaca como positiva; por debajo, como alerta.
const UMBRAL_ASISTENCIA_REGULAR = 75;

interface PorcentajeAsistenciaProps {
  porcentaje: number | null;
}

function PorcentajeAsistencia({ porcentaje }: PorcentajeAsistenciaProps) {
  if (porcentaje === null) {
    return (
      <span className="w-fit inline-flex items-center px-3 py-1 rounded-full font-label text-label-md font-medium bg-surface-variant text-on-surface-variant">
        Sin datos
      </span>
    );
  }

  const esRegular = porcentaje >= UMBRAL_ASISTENCIA_REGULAR;
  return (
    <span
      className={`w-fit inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label text-label-md font-bold ${
        esRegular ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-error'
      }`}
    >
      <span className="material-symbols-outlined text-[1.1rem]">
        {esRegular ? 'event_available' : 'event_busy'}
      </span>
      {porcentaje}%
    </span>
  );
}

export default PorcentajeAsistencia;
