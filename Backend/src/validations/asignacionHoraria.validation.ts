import { z } from "zod";

/**
 * Esquemas de validación (Zod) para la entidad AsignacionHoraria.
 * Basado en prisma/schema.prisma. Se omite el id autoincremental.
 */
export const asignacionHorariaCreateSchema = z.object({
  personalId: z
    .number("El personalId debe ser un número")
    .int("El personalId debe ser un número entero")
    .positive("Debe ser un número positivo"),
  tipoCargo: z.enum(
    [
      "Auxiliar",
      "Directivo",
      "EMATP",
      "Preceptor",
      "Profesor",
      "Prosecretario",
      "Secretario",
      "Vicedirectivo",
    ],
    "El tipo de cargo no es válido",
  ),
  situacionRevista: z.enum(
    ["Titular", "Provisional", "Suplente", "TitularInterino", "ServicioProvisorio"],
    "La situación de revista no es válida",
  ),
  fechaIni: z.string("La fecha de inicio debe ser texto").trim().min(1, "La fecha de inicio es obligatoria"),
  fechaFin: z.string("La fecha de fin debe ser texto").trim().min(1, "La fecha de fin es obligatoria"),
  asignacionHorariaCubiertaId: z
    .number("El asignacionHorariaCubiertaId debe ser un número")
    .int("El asignacionHorariaCubiertaId debe ser un número entero")
    .positive("Debe ser un número positivo")
    .optional(),
  // Solo se completa en las asignaciones de tipoCargo Profesor: junto con los
  // cursos determina qué cursadas dicta, y es lo que permite acotar por fila
  // las calificaciones que carga.
  materiaId: z
    .number("El materiaId debe ser un número")
    .int("El materiaId debe ser un número entero")
    .positive("Debe ser un número positivo")
    .optional(),
});

export const asignacionHorariaUpdateSchema = asignacionHorariaCreateSchema.partial();

export type AsignacionHorariaCreate = z.infer<typeof asignacionHorariaCreateSchema>;
export type AsignacionHorariaUpdate = z.infer<typeof asignacionHorariaUpdateSchema>;
