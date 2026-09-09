/**
 * Permisos del sistema: uno por cada par (entidad, acción).
 *
 * El `codigo` es la clave estable que usa `authorize()`; la `descripcion` es el
 * texto legible que se muestra en pantalla. Ambos son @unique en la tabla
 * Permiso.
 *
 * IMPORTANTE: los códigos están escritos explícitamente y NO deben cambiar,
 * porque la base de datos los referencia. Si se agrega un recurso nuevo hay que
 * seguir numerando desde p101 en adelante, nunca reordenar los existentes.
 *
 * Equivalencia método HTTP -> acción:
 *   GET / y GET /:id -> ver
 *   POST /           -> crear
 *   PUT /:id         -> editar
 *   PATCH /:id       -> editar    (baja lógica: NO tiene permiso propio)
 *   DELETE /:id      -> eliminar  (borrado físico: solo el Administrador)
 */
export const PERMISOS = {
  ASIGNACIONES_HORARIAS:       { ver: "p1",  crear: "p2",  editar: "p3",  eliminar: "p4"   },
  ASISTENCIAS_INSTITUCIONALES: { ver: "p5",  crear: "p6",  editar: "p7",  eliminar: "p8"   },
  AULAS:                       { ver: "p9",  crear: "p10", editar: "p11", eliminar: "p12"  },
  BLOQUES_HORARIOS:            { ver: "p13", crear: "p14", editar: "p15", eliminar: "p16"  },
  CARGAS_INTENSIFICACION:      { ver: "p17", crear: "p18", editar: "p19", eliminar: "p20"  },
  CARGAS_NUMERICAS:            { ver: "p21", crear: "p22", editar: "p23", eliminar: "p24"  },
  CARGAS_VALORATIVAS:          { ver: "p25", crear: "p26", editar: "p27", eliminar: "p28"  },
  CICLOS_LECTIVOS:             { ver: "p29", crear: "p30", editar: "p31", eliminar: "p32"  },
  CONTACTOS_EMERGENCIA:        { ver: "p33", crear: "p34", editar: "p35", eliminar: "p36"  },
  CURSADAS:                    { ver: "p37", crear: "p38", editar: "p39", eliminar: "p40"  },
  CURSOS:                      { ver: "p41", crear: "p42", editar: "p43", eliminar: "p44"  },
  DOMICILIOS:                  { ver: "p45", crear: "p46", editar: "p47", eliminar: "p48"  },
  ESTUDIANTES:                 { ver: "p49", crear: "p50", editar: "p51", eliminar: "p52"  },
  INSCRIPCIONES:               { ver: "p53", crear: "p54", editar: "p55", eliminar: "p56"  },
  INSCRIPCIONES_MESA:          { ver: "p57", crear: "p58", editar: "p59", eliminar: "p60"  },
  MATERIAS:                    { ver: "p61", crear: "p62", editar: "p63", eliminar: "p64"  },
  MATRICULAS:                  { ver: "p65", crear: "p66", editar: "p67", eliminar: "p68"  },
  MESAS_EXAMEN:                { ver: "p69", crear: "p70", editar: "p71", eliminar: "p72"  },
  ORIENTACIONES:               { ver: "p73", crear: "p74", editar: "p75", eliminar: "p76"  },
  PERIODOS_CARGA:              { ver: "p77", crear: "p78", editar: "p79", eliminar: "p80"  },
  PERMISOS:                    { ver: "p81", crear: "p82", editar: "p83", eliminar: "p84"  },
  PERSONAS:                    { ver: "p85", crear: "p86", editar: "p87", eliminar: "p88"  },
  PERSONAL:                    { ver: "p89", crear: "p90", editar: "p91", eliminar: "p92"  },
  ROLES:                       { ver: "p93", crear: "p94", editar: "p95", eliminar: "p96"  },
  USUARIOS:                    { ver: "p97", crear: "p98", editar: "p99", eliminar: "p100" },
} as const;

/** Clave de recurso dentro de PERMISOS. */
export type ClaveRecurso = keyof typeof PERMISOS;

/** Conjunto de códigos de un recurso, tal como lo consume cada archivo de rutas. */
export type PermisosDeRecurso = (typeof PERMISOS)[ClaveRecurso];

/** Nombre legible de cada recurso, para componer la descripción del permiso. */
const ENTIDADES: Record<ClaveRecurso, string> = {
  ASIGNACIONES_HORARIAS: "Asignaciones Horarias",
  ASISTENCIAS_INSTITUCIONALES: "Asistencias Institucionales",
  AULAS: "Aulas",
  BLOQUES_HORARIOS: "Bloques Horarios",
  CARGAS_INTENSIFICACION: "Cargas de Intensificación",
  CARGAS_NUMERICAS: "Cargas Numéricas",
  CARGAS_VALORATIVAS: "Cargas Valorativas",
  CICLOS_LECTIVOS: "Ciclos Lectivos",
  CONTACTOS_EMERGENCIA: "Contactos de Emergencia",
  CURSADAS: "Cursadas",
  CURSOS: "Cursos",
  DOMICILIOS: "Domicilios",
  ESTUDIANTES: "Estudiantes",
  INSCRIPCIONES: "Inscripciones",
  INSCRIPCIONES_MESA: "Inscripciones a Mesa",
  MATERIAS: "Materias",
  MATRICULAS: "Matrículas",
  MESAS_EXAMEN: "Mesas de Examen",
  ORIENTACIONES: "Orientaciones",
  PERIODOS_CARGA: "Períodos de Carga",
  PERMISOS: "Permisos",
  PERSONAS: "Personas",
  PERSONAL: "Personal",
  ROLES: "Roles",
  USUARIOS: "Usuarios",
};

const VERBOS = {
  ver: "Ver",
  crear: "Crear",
  editar: "Editar",
  eliminar: "Eliminar",
} as const;

/**
 * Los 100 permisos del sistema, derivados de PERMISOS + ENTIDADES.
 * Lo consume prisma/seed.ts para poblar la tabla Permiso.
 */
export const CATALOGO_PERMISOS: { codigo: string; descripcion: string }[] = (
  Object.keys(PERMISOS) as ClaveRecurso[]
).flatMap((clave) =>
  (Object.keys(VERBOS) as (keyof typeof VERBOS)[]).map((accion) => ({
    codigo: PERMISOS[clave][accion],
    descripcion: `${VERBOS[accion]} ${ENTIDADES[clave]}`,
  })),
);
