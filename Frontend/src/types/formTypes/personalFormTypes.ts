export type BloqueLibreForm = {
  // Uno o más días (ej. "Todos los días" o un rango como Lunes a Viernes), todos a la misma hora.
  dias: string[];
  horaIni: string;
  horaFin: string;
};

export type HorarioForm = {
  tipoCargo: string;
  situacionRevista: string;
  fechaIni: string;
  fechaFin: string;
  // Profesor: la asignación ocupa todos los bloques de esta cursada.
  cursadaId: string;
  // Resto de los cargos (incluido Preceptor): bloques horarios propios (día + horario),
  // se reutilizan o se crean al guardar.
  bloquesLibres: BloqueLibreForm[];
  // Preceptor: uno o más cursos a cargo (independiente de sus bloques horarios propios).
  cursoIds: number[];
};

export type CamposPrincipalesPersonal = 'apellido' | 'nombre' | 'email' | 'dni' | 'cuil' | 'telefono';

export type FormPersonal = Record<CamposPrincipalesPersonal, string> & {
  horarios: HorarioForm[];
};

export type ErroresPrincipalesPersonal = Partial<Record<CamposPrincipalesPersonal, string>>;

export type ErroresHorario = Partial<Record<
  'tipoCargo' | 'situacionRevista' | 'fechaIni' | 'fechaFin' | 'cursadaId' | 'bloquesLibres' | 'cursoIds',
  string
>>;

export type ErroresBloqueLibre = Partial<Record<'dias' | 'horaIni' | 'horaFin', string>>;
