import { prisma } from "../config/prisma";
import type { UsuarioAutenticado } from "../types/auth.types";

/**
 * Alcance por fila de un usuario autenticado.
 *
 * `null` significa SIN restricción: el service no agrega ningún filtro. Un
 * array (aunque esté vacío) significa restringido exactamente a esos ids, y un
 * array vacío devuelve listados vacíos, que es lo correcto para alguien que
 * todavía no tiene ninguna asignación horaria cargada.
 *
 * Los permisos de `authorize()` deciden QUÉ operaciones puede hacer un usuario;
 * el alcance decide SOBRE QUÉ FILAS. Son capas independientes.
 */
export type Alcance = {
  /** Cursos donde el usuario tiene asignación horaria. */
  cursosIds: number[] | null;
  /** Cursadas que dicta o supervisa. */
  cursadasIds: number[] | null;
  /** DNI de los estudiantes alcanzados por esos cursos/cursadas. */
  estudiantesDni: number[] | null;
};

/** Alcance sin restricciones: Administrador, equipo de conducción y EMATP. */
export const ALCANCE_TOTAL: Alcance = {
  cursosIds: null,
  cursadasIds: null,
  estudiantesDni: null,
};

/**
 * Roles cuyo acceso está acotado a sus propios cursos o cursadas, según la
 * sección "Roles del sistema" de matriz-permisos.md. Cualquier otro rol
 * (Administrador, Directivo, Vicedirectivo, Secretario, Prosecretario, EMATP)
 * ve el sistema completo.
 */
const ROLES_ACOTADOS = new Set(["Preceptor", "Docente"]);

/**
 * Resuelve a qué filas llega el usuario, a partir de sus asignaciones horarias.
 *
 * - Preceptor: los cursos donde tiene asignación, todas las cursadas de esos
 *   cursos y los estudiantes matriculados en ellos.
 * - Profesor (rol "Docente"): las cursadas que coinciden con el par
 *   (curso, materia) de sus asignaciones, y los estudiantes inscriptos.
 *
 * Si el usuario tiene AMBOS roles, el alcance es la unión. Si tiene además un
 * rol sin restricción, gana ese: el acceso más amplio prevalece, igual que
 * ocurre con la unión de permisos.
 */
export async function resolverAlcance(usuario: UsuarioAutenticado): Promise<Alcance> {
  const tieneRolSinRestriccion = usuario.roles.some((rol) => !ROLES_ACOTADOS.has(rol));

  if (tieneRolSinRestriccion) {
    return ALCANCE_TOTAL;
  }

  const esPreceptor = usuario.roles.includes("Preceptor");
  const esProfesor = usuario.roles.includes("Docente");

  const asignaciones = await prisma.asignacionHoraria.findMany({
    where: {
      personalId: usuario.personalId,
      tipoCargo: { in: [...(esPreceptor ? ["Preceptor" as const] : []), ...(esProfesor ? ["Profesor" as const] : [])] },
    },
    select: { tipoCargo: true, materiaId: true, cursos: { select: { id: true } } },
  });

  const cursosIds = new Set<number>();
  const cursadasIds = new Set<number>();

  // Preceptor: supervisa el curso entero, así que alcanza todas sus cursadas.
  const cursosDePreceptor = asignaciones
    .filter((asignacion) => asignacion.tipoCargo === "Preceptor")
    .flatMap((asignacion) => asignacion.cursos.map((curso) => curso.id));

  // Profesor: solo la cursada que corresponde al par (curso, materia) que dicta.
  const paresDeProfesor = asignaciones
    .filter((asignacion) => asignacion.tipoCargo === "Profesor" && asignacion.materiaId !== null)
    .flatMap((asignacion) =>
      asignacion.cursos.map((curso) => ({ cursoId: curso.id, materiaId: asignacion.materiaId! })),
    );

  for (const id of [...cursosDePreceptor, ...paresDeProfesor.map((par) => par.cursoId)]) {
    cursosIds.add(id);
  }

  if (cursosDePreceptor.length > 0 || paresDeProfesor.length > 0) {
    const cursadas = await prisma.cursada.findMany({
      where: {
        OR: [
          ...(cursosDePreceptor.length > 0 ? [{ cursoId: { in: cursosDePreceptor } }] : []),
          ...paresDeProfesor.map((par) => ({ cursoId: par.cursoId, materiaId: par.materiaId })),
        ],
      },
      select: { id: true },
    });

    for (const cursada of cursadas) {
      cursadasIds.add(cursada.id);
    }
  }

  const estudiantesDni = new Set<number>();

  // Estudiantes matriculados en los cursos del preceptor.
  if (cursosDePreceptor.length > 0) {
    const matriculas = await prisma.matricula.findMany({
      where: { cursoId: { in: cursosDePreceptor } },
      select: { estudianteDni: true },
    });
    for (const matricula of matriculas) {
      estudiantesDni.add(matricula.estudianteDni);
    }
  }

  // Estudiantes inscriptos en las cursadas del profesor.
  if (cursadasIds.size > 0) {
    const inscripciones = await prisma.inscripcion.findMany({
      where: { cursadaId: { in: [...cursadasIds] } },
      select: { estudianteDni: true },
    });
    for (const inscripcion of inscripciones) {
      estudiantesDni.add(inscripcion.estudianteDni);
    }
  }

  return {
    cursosIds: [...cursosIds],
    cursadasIds: [...cursadasIds],
    estudiantesDni: [...estudiantesDni],
  };
}

/**
 * Resuelve el alcance de la petición actual.
 *
 * Los controllers de los recursos acotados lo llaman y se lo pasan al service.
 */
export async function alcanceDe(usuario: UsuarioAutenticado | undefined): Promise<Alcance> {
  if (!usuario) return ALCANCE_TOTAL;
  return resolverAlcance(usuario);
}

// ─── Constructores de filtros ───────────────────────────────────────────────
// Devuelven un objeto vacío cuando no hay restricción, para poder esparcirlos
// dentro de cualquier `where` sin condicionales en cada service.

/** Filtra las filas que cuelgan de un Estudiante (por dni). */
export function filtroEstudianteDni(alcance: Alcance) {
  return alcance.estudiantesDni === null ? {} : { estudianteDni: { in: alcance.estudiantesDni } };
}

/** Filtra al propio Estudiante (su clave de negocio es el dni). */
export function filtroEstudiante(alcance: Alcance) {
  return alcance.estudiantesDni === null ? {} : { dni: { in: alcance.estudiantesDni } };
}

/** Filtra las filas que cuelgan de una Cursada. */
export function filtroCursada(alcance: Alcance) {
  return alcance.cursadasIds === null ? {} : { cursadaId: { in: alcance.cursadasIds } };
}

/** Filtra las filas que cuelgan de un Curso. */
export function filtroCurso(alcance: Alcance) {
  return alcance.cursosIds === null ? {} : { cursoId: { in: alcance.cursosIds } };
}

/** Filtra las cargas, que llegan a la cursada a través de su Inscripcion. */
export function filtroCargaPorCursada(alcance: Alcance) {
  return alcance.cursadasIds === null
    ? {}
    : { inscripcion: { cursadaId: { in: alcance.cursadasIds } } };
}
