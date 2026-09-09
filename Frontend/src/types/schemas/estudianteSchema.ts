import { z } from 'zod';
import { SOLO_LETRAS, SOLO_LETRAS_SIMPLE, EMAIL_REGEX, CUIL_REGEX, SOLO_NUMEROS } from '../../constants/regexPatterns';

export const estadoEstudianteSchema = z.enum(['Regular', 'Egresado', 'Libre', 'Desertor']);

export const contactoEmergenciaSchema = z.object({
  nombre:   z.string().min(1, 'El nombre es obligatorio'),
  apellido: z.string().min(1, 'El apellido es obligatorio'),
  dni:      z
    .string()
    .min(1, 'El DNI es obligatorio')
    .regex(SOLO_NUMEROS, 'Solo se permiten números')
    .refine(val => val.length >= 7 && val.length <= 8, 'El DNI debe tener entre 7 y 8 dígitos'),
  cuil:     z.string().regex(CUIL_REGEX, 'Formato inválido. Usá XX-XXXXXXXX-X'),
  email:    z.string().min(1, 'El email es obligatorio').regex(EMAIL_REGEX, 'Email inválido'),
  telefono: z.string().min(1, 'El teléfono es obligatorio'),
});
export type EstadoEstudiante = z.infer<typeof estadoEstudianteSchema>;

export const estudianteSchema = z.object({
  apellido: z
    .string()
    .min(1, 'El apellido es obligatorio')
    .regex(SOLO_LETRAS, 'Solo se permiten letras'),

  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .regex(SOLO_LETRAS, 'Solo se permiten letras'),

  dni: z
    .string()
    .min(1, 'El DNI es obligatorio')
    .regex(SOLO_NUMEROS, 'Solo se permiten números')
    .refine(val => val.length >= 7 && val.length <= 8, 'El DNI debe tener entre 7 y 8 dígitos'),

  cuil: z
    .string()
    .regex(CUIL_REGEX, 'Formato inválido. Usá XX-XXXXXXXX-X'),

  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .regex(EMAIL_REGEX, 'Email inválido'),

  telefono: z
    .string()
    .min(1, 'El teléfono es obligatorio')
    .regex(SOLO_NUMEROS, 'Solo se permiten números'),

  fechaNacimiento: z
    .string()
    .min(1, 'La fecha es obligatoria')
    .refine(val => {
      const fecha = new Date(val + 'T00:00:00');
      if (isNaN(fecha.getTime())) return false;
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999);
      return fecha <= hoy;
    }, 'La fecha no puede ser futura')
    .refine(val => {
      const fecha = new Date(val + 'T00:00:00');
      const hoy = new Date();
      const edadMinima = new Date(hoy.getFullYear() - 12, hoy.getMonth(), hoy.getDate());
      return fecha <= edadMinima;
    }, 'El estudiante debe tener al menos 12 años'),

  folio: z
    .string()
    .min(1, 'El folio es obligatorio')
    .regex(SOLO_NUMEROS, 'Solo se permiten números'),

  libro: z
    .string()
    .min(1, 'El libro es obligatorio')
    .regex(SOLO_NUMEROS, 'Solo se permiten números'),

  nacionalidad: z
    .string()
    .min(1, 'La nacionalidad es obligatoria')
    .regex(SOLO_LETRAS_SIMPLE, 'Solo se permiten letras'),

  calle: z
    .string()
    .min(1, 'La calle es obligatoria'),

  numero: z
    .string()
    .min(1, 'El número es obligatorio')
    .regex(SOLO_NUMEROS, 'Solo se permiten números'),
});

export type EstudianteFormData = z.infer<typeof estudianteSchema>;
