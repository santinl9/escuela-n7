import { PERMISOS, type PermisosDeRecurso } from "./permisos";

/**
 * Permisos que recibe cada rol del sistema.
 *
 * Derivado de la seccion "Roles del sistema" de matriz-permisos.md:
 *
 *  - Administrador: gestion total del sistema, usuarios, roles y configuracion.
 *  - Equipo de conduccion (Directivo, Vicedirectivo, Secretario, Prosecretario):
 *    gestion de personal y sus cargos, consulta de cursos y cursadas,
 *    planificacion de la trayectoria de los estudiantes, gestion de periodos de
 *    carga, ciclos lectivos, inscripciones (a cursadas y mesas), matriculaciones
 *    y mesas de examen.
 *  - Preceptor: registro de inasistencias institucionales de sus cursos,
 *    consulta de trayectorias y de estudiantes matriculados en esos cursos.
 *  - Profesor (rol "Docente"): carga de calificaciones numericas, valorativas y
 *    de intensificacion, registro de asistencias y consulta de estudiantes
 *    inscriptos, todo acotado a sus cursadas asignadas.
 *  - EMATP: consulta total del sistema.
 *
 * El borrado fisico (DELETE) es exclusivo del Administrador, salvo en la
 * estructura institucional, donde la conduccion tambien lo tiene. Los demas
 * roles dan de baja con el PATCH, que exige el permiso `editar`.
 */

const P = PERMISOS;

/** Los cuatro codigos de un recurso: Ver + Crear + Editar + Eliminar. */
const todas = (recurso: PermisosDeRecurso): string[] => [
  recurso.ver,
  recurso.crear,
  recurso.editar,
  recurso.eliminar,
];

/** Ver + Crear + Editar: "gestion" sin borrado fisico. */
const gestion = (recurso: PermisosDeRecurso): string[] => [
  recurso.ver,
  recurso.crear,
  recurso.editar,
];

/** Los 100 codigos del catalogo: el Administrador los recibe completos. */
const ADMINISTRADOR: string[] = Object.values(P).flatMap(todas);

/** "EMATP: consulta total del sistema" => Ver sobre los 25 recursos. */
const EMATP: string[] = Object.values(P).map((recurso) => recurso.ver);

/**
 * Equipo de conduccion. Los cuatro roles comparten exactamente este conjunto:
 * la descripcion los trata como un unico actor, pero se mantienen separados
 * porque el enum TipoCargo y el frontend los distinguen.
 */
const CONDUCCION: string[] = [
  // Gestion de personal y sus cargos.
  ...gestion(P.PERSONAL),
  ...gestion(P.ASIGNACIONES_HORARIAS),
  ...gestion(P.PERSONAS),
  // Consulta de cursos y cursadas de estructura institucional.
  P.CURSOS.ver,
  P.CURSADAS.ver,
  // Planificacion de la trayectoria de los estudiantes.
  ...gestion(P.ESTUDIANTES),
  ...gestion(P.DOMICILIOS),
  ...gestion(P.CONTACTOS_EMERGENCIA),
  // Gestion de periodos de carga y ciclos lectivos.
  ...gestion(P.PERIODOS_CARGA),
  ...gestion(P.CICLOS_LECTIVOS),
  // Gestion de inscripciones (a cursadas y a mesas) y matriculaciones.
  ...gestion(P.INSCRIPCIONES),
  ...gestion(P.INSCRIPCIONES_MESA),
  ...gestion(P.MATRICULAS),
  // Gestion de mesas de examen.
  ...gestion(P.MESAS_EXAMEN),
  // Estructura institucional: gestion completa, borrado incluido.
  ...todas(P.AULAS),
  ...todas(P.BLOQUES_HORARIOS),
  ...todas(P.MATERIAS),
  ...todas(P.ORIENTACIONES),
];

/** Preceptor: acotado por fila a los cursos donde tiene asignacion horaria. */
const PRECEPTOR: string[] = [
  // Registro periodico de inasistencias institucionales.
  ...gestion(P.ASISTENCIAS_INSTITUCIONALES),
  // Consulta de trayectorias y de estudiantes matriculados en sus cursos.
  P.ESTUDIANTES.ver,
  P.MATRICULAS.ver,
  P.INSCRIPCIONES.ver,
  P.DOMICILIOS.ver,
  P.CONTACTOS_EMERGENCIA.ver,
];

/** Profesor: acotado por fila a las cursadas (curso + materia) que dicta. */
const PROFESOR: string[] = [
  // Carga de calificaciones numericas, valorativas y de intensificacion.
  ...gestion(P.CARGAS_NUMERICAS),
  ...gestion(P.CARGAS_VALORATIVAS),
  ...gestion(P.CARGAS_INTENSIFICACION),
  // Registro de asistencias de los alumnos de sus cursadas.
  ...gestion(P.ASISTENCIAS_INSTITUCIONALES),
  // Consulta de los periodos de carga habilitados y de sus inscriptos.
  P.PERIODOS_CARGA.ver,
  P.ESTUDIANTES.ver,
  P.INSCRIPCIONES.ver,
];

/** nombre de Rol (@unique) => codigos de permiso. Lo consume prisma/seed.ts. */
export const PERMISOS_POR_ROL: Record<string, string[]> = {
  Administrador: ADMINISTRADOR,
  Directivo: CONDUCCION,
  Vicedirectivo: CONDUCCION,
  Secretario: CONDUCCION,
  Prosecretario: CONDUCCION,
  Preceptor: PRECEPTOR,
  Docente: PROFESOR,
  EMATP: EMATP,
};
