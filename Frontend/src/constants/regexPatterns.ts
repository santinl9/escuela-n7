// Con apóstrofo e hífen: nombres propios (O'Brien, García-López)
export const SOLO_LETRAS        = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
// Sin apóstrofo ni hífen: nacionalidades, valores simples
export const SOLO_LETRAS_SIMPLE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
export const EMAIL_REGEX        = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const CUIL_REGEX         = /^\d{2}-\d{7,8}-\d$/;
export const SOLO_NUMEROS       = /^\d+$/;
