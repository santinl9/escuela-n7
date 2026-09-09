import { z } from 'zod';

export const bloqueHorarioSchema = z
  .object({
    dia: z.string().min(1, 'El día es obligatorio'),
    horaIni: z.string().min(1, 'La hora de inicio es obligatoria'),
    horaFin: z.string().min(1, 'La hora de fin es obligatoria'),
  })
  .refine(data => data.horaFin > data.horaIni, {
    message: 'La hora de fin debe ser posterior a la hora de inicio',
    path: ['horaFin'],
  });

// Variante para los "bloques libres" (cargos no docentes): un mismo bloque puede repetirse
// en varios días (ej. "Todos los días" o un rango como Lunes a Viernes) a la misma hora.
export const bloqueLibreSchema = z
  .object({
    dias: z.array(z.string()).min(1, 'Seleccioná al menos un día'),
    horaIni: z.string().min(1, 'La hora de inicio es obligatoria'),
    horaFin: z.string().min(1, 'La hora de fin es obligatoria'),
  })
  .refine(data => data.horaFin > data.horaIni, {
    message: 'La hora de fin debe ser posterior a la hora de inicio',
    path: ['horaFin'],
  });

export type BloqueHorarioFormData = z.infer<typeof bloqueHorarioSchema>;
export type BloqueLibreFormData = z.infer<typeof bloqueLibreSchema>;
