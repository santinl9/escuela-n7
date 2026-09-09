const ESTADO_CLASES: Record<string, string> = {
  Regular:    'bg-secondary-container text-on-secondary-container',
  Egresado:   'bg-surface-container-high text-on-surface',
  Libre:      'bg-surface-variant text-on-surface-variant',
  Desertor:   'bg-error-container text-error',
  Activa:     'bg-primary text-background',
  Finalizada: 'bg-surface-variant text-on-surface-variant',
  Vigente:    'bg-primary text-background',
  Activo:     'bg-primary text-background',
  Inactivo:   'bg-error-container text-error',
  Aprobada:   'bg-primary text-background',
  Desaprobado: 'bg-error-container text-error',
  Discontinuo: 'bg-surface-variant text-on-surface-variant',
  'Asistencia Completa': 'bg-primary text-background',
  'Falta Completa': 'bg-secondary-container text-on-secondary-container',
  'Media Falta': 'bg-error-container text-error',
  Justificada: 'bg-primary text-background',
};

export function estadoClase(estado: string) {
  return ESTADO_CLASES[estado] ?? 'bg-surface-container text-on-surface-variant';
}
