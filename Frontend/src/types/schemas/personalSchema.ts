import { z } from 'zod';
import { SOLO_LETRAS, EMAIL_REGEX, SOLO_NUMEROS, CUIL_REGEX } from '../../constants/regexPatterns';

export const personalSchema = z.object({
  apellido: z
    .string()
    .min(1, 'El apellido es obligatorio')
    .regex(SOLO_LETRAS, 'Solo se permiten letras'),

  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .regex(SOLO_LETRAS, 'Solo se permiten letras'),

  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .regex(EMAIL_REGEX, 'Email inválido'),

  dni: z
    .string()
    .min(1, 'El DNI es obligatorio')
    .regex(SOLO_NUMEROS, 'Solo se permiten números')
    .refine(val => val.length >= 7 && val.length <= 8, 'El DNI debe tener entre 7 y 8 dígitos'),

  cuil: z
    .string()
    .regex(CUIL_REGEX, 'Formato inválido. Usá XX-XXXXXXXX-X'),

  telefono: z
    .string()
    .min(1, 'El teléfono es obligatorio')
    .regex(SOLO_NUMEROS, 'Solo se permiten números'),
});

// Cada asignación horaria lleva su propio tipo de cargo y situación de revista: una misma
// persona puede tener varias (ej. Profesor titular en una cursada y Preceptor en otra).
// Solo se validan acá los campos siempre presentes; la selección de bloques horarios
// (cursada, curso o bloques propios, según el tipo de cargo) se valida aparte en el hook.
export const horarioSchema = z
  .object({
    tipoCargo: z.string().min(1, 'El tipo de cargo es obligatorio'),
    situacionRevista: z.string().min(1, 'La situación de revista es obligatoria'),
    fechaIni: z.string().min(1, 'La fecha de inicio es obligatoria'),
    fechaFin: z.string(),
  })
  .refine(data => !data.fechaFin || data.fechaFin > data.fechaIni, {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['fechaFin'],
  });

export type PersonalFormData = z.infer<typeof personalSchema>;
export type HorarioFormData = z.infer<typeof horarioSchema>;
