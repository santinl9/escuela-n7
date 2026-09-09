import { useState } from 'react';
import type { Personal } from '../types/Personal';
import type { AsignacionHoraria } from '../types/AsignacionHoraria';
import type { BloqueHorario } from '../types/BloqueHorario';
import { personalSchema, horarioSchema } from '../types/schemas/personalSchema';
import { bloqueLibreSchema } from '../types/schemas/bloqueHorarioSchema';
import type {
  BloqueLibreForm,
  ErroresBloqueLibre,
  FormPersonal,
  ErroresPrincipalesPersonal,
  ErroresHorario,
  HorarioForm,
} from '../types/formTypes/personalFormTypes';
import { bloqueLibreVacio, horarioVacio, formVacioPersonal, erroresPersonalDuplicado } from '../constants/personalForm';
import { formatCuil } from '../types/formTypes/estudianteFormTypes';

type CamposEscalaresHorario = 'tipoCargo' | 'situacionRevista' | 'fechaIni' | 'fechaFin';

export function usePersonalModal() {
  const [modalAbierto, setModalAbierto]       = useState(false);
  const [modoEdicion, setModoEdicion]         = useState(false);
  const [personalIdEditando, setPersonalIdEditando] = useState<string | null>(null);
  const [form, setForm]                       = useState<FormPersonal>({ ...formVacioPersonal, horarios: [{ ...horarioVacio }] });
  const [errores, setErrores]                 = useState<ErroresPrincipalesPersonal>({});
  const [erroresHorarios, setErroresHorarios] = useState<ErroresHorario[]>([{}]);
  const [erroresBloquesLibres, setErroresBloquesLibres] = useState<ErroresBloqueLibre[][]>([[]]);

  const abrirModalNuevo = () => {
    setForm({ ...formVacioPersonal, horarios: [{ ...horarioVacio }] });
    setErrores({});
    setErroresHorarios([{}]);
    setErroresBloquesLibres([[]]);
    setModoEdicion(false);
    setPersonalIdEditando(null);
    setModalAbierto(true);
  };

  // Reconstruye, a partir de los bloques ya asignados, en qué modo estaba cargada cada
  // asignación existente: Profesor -> la cursada de sus bloques; el resto (incluido
  // Preceptor) -> los bloques propios tal cual (con su id, para reutilizarlos).
  const abrirModalEdicion = (
    personal: Personal,
    horariosExistentes: AsignacionHoraria[] = [],
    bloques: BloqueHorario[] = []
  ) => {
    const horarios: HorarioForm[] = horariosExistentes.length > 0
      ? horariosExistentes.map(h => {
          const bloquesDeH = h.bloqueHorarioIds
            .map(id => bloques.find(b => b.id === id))
            .filter((b): b is BloqueHorario => b !== undefined);

          if (h.tipoCargo === 'Profesor') {
            const cursadaId = bloquesDeH[0]?.cursadaId;
            return {
              tipoCargo: h.tipoCargo,
              situacionRevista: h.situacionRevista,
              fechaIni: h.fechaIni,
              fechaFin: h.fechaFin,
              cursadaId: cursadaId !== undefined ? String(cursadaId) : '',
              bloquesLibres: [{ ...bloqueLibreVacio }],
              cursoIds: [],
            };
          }

          const bloquesLibres: BloqueLibreForm[] = bloquesDeH.length > 0
            ? bloquesDeH.map(b => ({ dias: [b.dia], horaIni: b.horaIni, horaFin: b.horaFin }))
            : [{ ...bloqueLibreVacio }];
          return {
            tipoCargo: h.tipoCargo,
            situacionRevista: h.situacionRevista,
            fechaIni: h.fechaIni,
            fechaFin: h.fechaFin,
            cursadaId: '',
            bloquesLibres,
            cursoIds: h.cursoIds ?? [],
          };
        })
      : [{ ...horarioVacio }];

    setForm({
      apellido: personal.apellido,
      nombre:   personal.nombre,
      email:    personal.email,
      dni:      String(personal.dni),
      cuil:     personal.cuil,
      telefono: String(personal.telefono),
      horarios,
    });
    setErrores({});
    setErroresHorarios(horarios.map(() => ({})));
    setErroresBloquesLibres(horarios.map(h => h.bloquesLibres.map(() => ({}))));
    setModoEdicion(true);
    setPersonalIdEditando(personal.id);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setForm({ ...formVacioPersonal, horarios: [{ ...horarioVacio }] });
    setErrores({});
    setErroresHorarios([{}]);
    setErroresBloquesLibres([[]]);
  };

  const handleChange = (campo: keyof Omit<FormPersonal, 'horarios'>, valor: string) => {
    const formatted = campo === 'cuil' ? formatCuil(valor) : valor;
    setForm(prev => ({ ...prev, [campo]: formatted }));
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: undefined }));
    }
  };

  // Cambiar el tipo de cargo reinicia el modo de bloques (cursada / bloques propios / cursos),
  // porque cada tipo usa una selección distinta e incompatible con la anterior.
  const handleHorarioChange = (idx: number, campo: CamposEscalaresHorario, valor: string) => {
    setForm(prev => {
      const horarios = [...prev.horarios];
      horarios[idx] = campo === 'tipoCargo'
        ? { ...horarios[idx], tipoCargo: valor, cursadaId: '', bloquesLibres: [{ ...bloqueLibreVacio }], cursoIds: [] }
        : { ...horarios[idx], [campo]: valor };
      return { ...prev, horarios };
    });
    setErroresHorarios(prev => {
      const next = [...prev];
      next[idx] = campo === 'tipoCargo' ? {} : { ...next[idx], [campo]: undefined };
      return next;
    });
    if (campo === 'tipoCargo') {
      setErroresBloquesLibres(prev => {
        const next = [...prev];
        next[idx] = [{}];
        return next;
      });
    }
  };

  // Preceptor: uno o más cursos a cargo, independientes de sus bloques horarios propios.
  const handleToggleCursoHorario = (idx: number, cursoId: number) => {
    setForm(prev => {
      const horarios = [...prev.horarios];
      const actual = horarios[idx].cursoIds;
      const cursoIds = actual.includes(cursoId) ? actual.filter(id => id !== cursoId) : [...actual, cursoId];
      horarios[idx] = { ...horarios[idx], cursoIds };
      return { ...prev, horarios };
    });
    setErroresHorarios(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], cursoIds: undefined };
      return next;
    });
  };

  const handleCursadaDeHorarioChange = (idx: number, valor: string) => {
    setForm(prev => {
      const horarios = [...prev.horarios];
      horarios[idx] = { ...horarios[idx], cursadaId: valor };
      return { ...prev, horarios };
    });
    setErroresHorarios(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], cursadaId: undefined };
      return next;
    });
  };

  const agregarHorario = () => {
    setForm(prev => ({ ...prev, horarios: [...prev.horarios, { ...horarioVacio }] }));
    setErroresHorarios(prev => [...prev, {}]);
    setErroresBloquesLibres(prev => [...prev, []]);
  };

  const eliminarHorario = (idx: number) => {
    setForm(prev => ({ ...prev, horarios: prev.horarios.filter((_, i) => i !== idx) }));
    setErroresHorarios(prev => prev.filter((_, i) => i !== idx));
    setErroresBloquesLibres(prev => prev.filter((_, i) => i !== idx));
  };

  // ── Bloques propios (cargos que no son Profesor ni Preceptor) ───────────────────────────

  const handleBloqueLibreChange = (horarioIdx: number, bloqueIdx: number, campo: 'horaIni' | 'horaFin', valor: string) => {
    setForm(prev => {
      const horarios = [...prev.horarios];
      const bloquesLibres = [...horarios[horarioIdx].bloquesLibres];
      bloquesLibres[bloqueIdx] = { ...bloquesLibres[bloqueIdx], [campo]: valor };
      horarios[horarioIdx] = { ...horarios[horarioIdx], bloquesLibres };
      return { ...prev, horarios };
    });
    setErroresBloquesLibres(prev => {
      const next = prev.map(arr => [...arr]);
      next[horarioIdx] = next[horarioIdx] ?? [];
      next[horarioIdx][bloqueIdx] = { ...next[horarioIdx][bloqueIdx], [campo]: undefined };
      return next;
    });
  };

  // Los días de un bloque libre se reemplazan como conjunto (selección individual, "Todos los
  // días" o un rango), no campo por campo como el resto de los valores del bloque.
  const handleDiasBloqueLibreChange = (horarioIdx: number, bloqueIdx: number, dias: string[]) => {
    setForm(prev => {
      const horarios = [...prev.horarios];
      const bloquesLibres = [...horarios[horarioIdx].bloquesLibres];
      bloquesLibres[bloqueIdx] = { ...bloquesLibres[bloqueIdx], dias };
      horarios[horarioIdx] = { ...horarios[horarioIdx], bloquesLibres };
      return { ...prev, horarios };
    });
    setErroresBloquesLibres(prev => {
      const next = prev.map(arr => [...arr]);
      next[horarioIdx] = next[horarioIdx] ?? [];
      next[horarioIdx][bloqueIdx] = { ...next[horarioIdx][bloqueIdx], dias: undefined };
      return next;
    });
  };

  const agregarBloqueLibre = (horarioIdx: number) => {
    setForm(prev => {
      const horarios = [...prev.horarios];
      horarios[horarioIdx] = { ...horarios[horarioIdx], bloquesLibres: [...horarios[horarioIdx].bloquesLibres, { ...bloqueLibreVacio }] };
      return { ...prev, horarios };
    });
    setErroresBloquesLibres(prev => {
      const next = prev.map(arr => [...arr]);
      next[horarioIdx] = [...(next[horarioIdx] ?? []), {}];
      return next;
    });
  };

  const eliminarBloqueLibre = (horarioIdx: number, bloqueIdx: number) => {
    setForm(prev => {
      const horarios = [...prev.horarios];
      horarios[horarioIdx] = {
        ...horarios[horarioIdx],
        bloquesLibres: horarios[horarioIdx].bloquesLibres.filter((_, i) => i !== bloqueIdx),
      };
      return { ...prev, horarios };
    });
    setErroresBloquesLibres(prev => {
      const next = prev.map(arr => [...arr]);
      next[horarioIdx] = (next[horarioIdx] ?? []).filter((_, i) => i !== bloqueIdx);
      return next;
    });
  };

  const validarForm = (
    personalExistente: Personal[] = []
  ): boolean => {
    const { horarios, ...camposPrincipales } = form;
    const resultadoPrincipal = personalSchema.safeParse(camposPrincipales);

    const errs: ErroresPrincipalesPersonal = {};
    if (!resultadoPrincipal.success) {
      resultadoPrincipal.error.issues.forEach(issue => {
        const f = String(issue.path[0]) as keyof ErroresPrincipalesPersonal;
        if (!errs[f]) errs[f] = issue.message;
      });
    }
    const erroresDuplicados = erroresPersonalDuplicado(camposPrincipales, personalExistente, personalIdEditando);
    (Object.keys(erroresDuplicados) as (keyof ErroresPrincipalesPersonal)[]).forEach(f => {
      if (!errs[f]) errs[f] = erroresDuplicados[f];
    });

    const sinAsignaciones = horarios.length === 0;

    const nuevosErroresHorarios: ErroresHorario[] = horarios.map(h => {
      const res = horarioSchema.safeParse(h);
      if (res.success) return {};
      const errs: ErroresHorario = {};
      res.error.issues.forEach(issue => {
        const f = String(issue.path[0]) as keyof ErroresHorario;
        if (!errs[f]) errs[f] = issue.message;
      });
      return errs;
    });

    const nuevosErroresBloquesLibres: ErroresBloqueLibre[][] = horarios.map(() => []);

    horarios.forEach((h, idx) => {
      if (Object.keys(nuevosErroresHorarios[idx]).length > 0) return;

      if (h.tipoCargo === 'Profesor') {
        if (!h.cursadaId) {
          nuevosErroresHorarios[idx] = { ...nuevosErroresHorarios[idx], cursadaId: 'Seleccioná una cursada' };
        }
        return;
      }

      // Resto de los cargos (incluido Preceptor): bloques horarios propios (se reutilizan o se crean al guardar).
      const bloques = h.bloquesLibres;
      const erroresBloques: ErroresBloqueLibre[] = bloques.map(b => {
        const res = bloqueLibreSchema.safeParse(b);
        if (res.success) return {};
        const errs: ErroresBloqueLibre = {};
        res.error.issues.forEach(issue => {
          const f = String(issue.path[0]) as keyof ErroresBloqueLibre;
          if (!errs[f]) errs[f] = issue.message;
        });
        return errs;
      });

      // Dos bloques que comparten al menos un día no pueden superponerse en su franja horaria.
      bloques.forEach((b, i) => {
        if (Object.keys(erroresBloques[i]).length > 0) return;
        bloques.forEach((otro, j) => {
          if (i === j || Object.keys(erroresBloques[j]).length > 0) return;
          if (!b.dias.some(dia => otro.dias.includes(dia))) return;
          const seSuperponen = b.horaIni < otro.horaFin && otro.horaIni < b.horaFin;
          if (seSuperponen) {
            erroresBloques[i] = { ...erroresBloques[i], horaIni: 'Se superpone con otro bloque horario en algún día en común' };
          }
        });
      });

      nuevosErroresBloquesLibres[idx] = erroresBloques;

      if (bloques.length === 0) {
        nuevosErroresHorarios[idx] = { ...nuevosErroresHorarios[idx], bloquesLibres: 'Debe agregar al menos un bloque horario' };
      } else if (erroresBloques.some(e => Object.keys(e).length > 0)) {
        nuevosErroresHorarios[idx] = { ...nuevosErroresHorarios[idx], bloquesLibres: 'Revisá los bloques horarios cargados' };
      }

      // Preceptor: además de sus bloques horarios propios, debe tener al menos un curso a cargo.
      if (h.tipoCargo === 'Preceptor' && h.cursoIds.length === 0) {
        nuevosErroresHorarios[idx] = { ...nuevosErroresHorarios[idx], cursoIds: 'Debe asignar al menos un curso' };
      }
    });

    const hayErroresHorarios = nuevosErroresHorarios.some(e => Object.keys(e).length > 0);
    const hayErroresPrincipales = Object.keys(errs).length > 0;

    if (hayErroresPrincipales || hayErroresHorarios || sinAsignaciones) {
      setErrores(errs);
      setErroresHorarios(nuevosErroresHorarios);
      setErroresBloquesLibres(nuevosErroresBloquesLibres);
      return false;
    }

    setErrores({});
    setErroresHorarios(horarios.map(() => ({})));
    setErroresBloquesLibres(horarios.map(() => []));
    return true;
  };

  return {
    modalAbierto,
    modoEdicion,
    personalIdEditando,
    form,
    errores,
    erroresHorarios,
    erroresBloquesLibres,
    abrirModalNuevo,
    abrirModalEdicion,
    cerrarModal,
    handleChange,
    handleHorarioChange,
    handleCursadaDeHorarioChange,
    handleToggleCursoHorario,
    agregarHorario,
    eliminarHorario,
    handleBloqueLibreChange,
    handleDiasBloqueLibreChange,
    agregarBloqueLibre,
    eliminarBloqueLibre,
    validarForm,
  };
}
