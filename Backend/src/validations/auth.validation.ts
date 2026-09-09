import { z } from "zod";

/**
 * Esquemas de validación (Zod) para el módulo de autenticación.
 *
 * Usuario no tiene email propio en el schema: el email identifica al Personal
 * asociado (Personal.email es @unique).
 */

/** Credenciales de inicio de sesión. */
export const loginSchema = z.object({
  email: z
    .string("El email debe ser texto")
    .trim()
    .min(1, "El email es obligatorio")
    .email("El email no tiene un formato válido"),
  // A propósito NO se exige min(8) acá: la política de longitud se valida al
  // CREAR la contraseña, no al usarla. Pedirla en el login solo delataría el
  // formato de las contraseñas válidas ante quien esté probando credenciales.
  contrasenia: z
    .string("La contraseña debe ser texto")
    .min(1, "La contraseña es obligatoria"),
});

/**
 * Alta de Usuario para un Personal que YA existe en la institución.
 * `roles` viaja por nombre (Rol.nombre es @unique).
 */
export const registerSchema = z.object({
  email: z
    .string("El email debe ser texto")
    .trim()
    .min(1, "El email es obligatorio")
    .email("El email no tiene un formato válido"),
  contrasenia: z
    .string("La contraseña debe ser texto")
    .trim()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
  roles: z
    .array(z.string("Cada rol debe ser texto").trim().min(1, "El nombre del rol es obligatorio"))
    .min(1, "Debe indicar al menos un rol"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
