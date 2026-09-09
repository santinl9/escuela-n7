import type { BloqueLibreForm, HorarioForm, FormPersonal, ErroresPrincipalesPersonal } from '../types/formTypes/personalFormTypes';
import type { SituacionRevista } from '../types/AsignacionHoraria';
import type { Personal } from '../types/Personal';

export const bloqueLibreVacio: BloqueLibreForm = {
  dias: [],
  horaIni: '',
  horaFin: '',
};

export const horarioVacio: HorarioForm = {
  tipoCargo: '',
  situacionRevista: '',
  fechaIni: '',
  fechaFin: '',
  cursadaId: '',
  bloquesLibres: [{ ...bloqueLibreVacio }],
  cursoIds: [],
};

export const formVacioPersonal: FormPersonal = {
  apellido: '',
  nombre: '',
  email: '',
  dni: '',
  cuil: '',
  telefono: '',
  horarios: [{ ...horarioVacio }],
};

export const SITUACION_REVISTA_OPCIONES: SituacionRevista[] = [
  'Titular',
  'Provisional',
  'Suplente',
  'Titular Interino',
  'Servicio Provisorio',
];

// El DNI, CUIL y email no pueden repetirse entre distintas personas del personal.
export function erroresPersonalDuplicado(
  datos: { dni: string; cuil: string; email: string },
  personalExistente: Personal[],
  idExcluido: string | null
): ErroresPrincipalesPersonal {
  const otros = personalExistente.filter(p => p.id !== idExcluido);
  const errs: ErroresPrincipalesPersonal = {};

  if (otros.some(p => p.dni === Number(datos.dni))) {
    errs.dni = 'Ya existe una persona del personal con este DNI';
  }
  if (otros.some(p => p.cuil === datos.cuil)) {
    errs.cuil = 'Ya existe una persona del personal con este CUIL';
  }
  if (otros.some(p => p.email.trim().toLowerCase() === datos.email.trim().toLowerCase())) {
    errs.email = 'Ya existe una persona del personal con este email';
  }

  return errs;
}
