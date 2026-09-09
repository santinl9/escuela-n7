import { useState } from 'react';
import type { Cursada } from '../types/Cursada';
import type { BloqueHorario } from '../types/BloqueHorario';
import { cursadaSchema } from '../types/schemas/cursadaSchema';
import { bloqueHorarioSchema } from '../types/schemas/bloqueHorarioSchema';
import type { BloqueCursadaForm, ErroresBloqueCursada, ErroresCursada, FormCursada } from '../types/formTypes/cursadaFormTypes';
import { bloqueCursadaVacio, formVacioCursada } from '../constants/cursadaForm';

export function useCursadaModal() {
  const [modalAbierto, setModalAbierto]     = useState(false);
  const [modoEdicion, setModoEdicion]       = useState(false);
  const [idEditando, setIdEditando]         = useState<number | null>(null);
  const [form, setForm]                     = useState<FormCursada>({ ...formVacioCursada });
  const [errores, setErrores]               = useState<ErroresCursada>({});
  const [erroresBloques, setErroresBloques] = useState<ErroresBloqueCursada[]>([]);
  const [errorSinBloques, setErrorBloques]     = useState<string | undefined>(undefined);

  const abrirModalNuevo = () => {
    setForm({ ...formVacioCursada, bloques: [{ ...bloqueCursadaVacio }] });
    setErrores({});
    setErroresBloques([{}]);
    setErrorBloques(undefined);
    setModoEdicion(false);
    setIdEditando(null);
    setModalAbierto(true);
  };

  // Los bloques horarios ya existentes de la cursada se cargan tal cual (con su id) para reutilizarlos al guardar.
  // Toda cursada debe tener al menos uno, así que si no tuviera ninguno se ofrece una fila vacía para completar.
  const abrirModalEdicion = (cursada: Cursada, bloquesExistentes: BloqueHorario[]) => {
    const bloques: BloqueCursadaForm[] = bloquesExistentes.length > 0
      ? bloquesExistentes.map(b => ({ id: b.id, dia: b.dia, horaIni: b.horaIni, horaFin: b.horaFin }))
      : [{ ...bloqueCursadaVacio }];
    setForm({
      materiaId: String(cursada.materiaId),
      aulaId:    String(cursada.aulaId),
      tipo:      cursada.tipo,
      bloques,
    });
    setErrores({});
    setErroresBloques(bloques.map(() => ({})));
    setErrorBloques(undefined);
    setModoEdicion(true);
    setIdEditando(cursada.id);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setForm({ ...formVacioCursada, bloques: [{ ...bloqueCursadaVacio }] });
    setErrores({});
    setErroresBloques([{}]);
    setErrorBloques(undefined);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errores[name as keyof ErroresCursada]) {
      setErrores(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBloqueChange = (idx: number, campo: keyof BloqueCursadaForm, valor: string) => {
    setForm(prev => {
      const bloques = [...prev.bloques];
      bloques[idx] = { ...bloques[idx], [campo]: valor };
      return { ...prev, bloques };
    });
    setErroresBloques(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [campo]: undefined };
      return next;
    });
  };

  const agregarBloque = () => {
    setForm(prev => ({ ...prev, bloques: [...prev.bloques, { ...bloqueCursadaVacio }] }));
    setErroresBloques(prev => [...prev, {}]);
  };

  const eliminarBloque = (idx: number) => {
    setForm(prev => ({ ...prev, bloques: prev.bloques.filter((_, i) => i !== idx) }));
    setErroresBloques(prev => prev.filter((_, i) => i !== idx));
  };

  const validarForm = (): boolean => {
    const { bloques, ...camposPrincipales } = form;
    const resultadoPrincipal = cursadaSchema.safeParse(camposPrincipales);

    const sinBloques = bloques.length === 0;

    const nuevosErroresBloques: ErroresBloqueCursada[] = bloques.map(b => {
      const res = bloqueHorarioSchema.safeParse(b);
      if (res.success) return {};
      const errs: ErroresBloqueCursada = {};
      res.error.issues.forEach(issue => {
        const f = String(issue.path[0]) as keyof ErroresBloqueCursada;
        if (!errs[f]) errs[f] = issue.message;
      });
      return errs;
    });

    // Los bloques de un mismo día no pueden superponerse en su franja horaria.
    // Solo se comparan entre sí los que ya son válidos individualmente.
    bloques.forEach((b, i) => {
      if (Object.keys(nuevosErroresBloques[i]).length > 0) return;
      bloques.forEach((otro, j) => {
        if (i === j || Object.keys(nuevosErroresBloques[j]).length > 0) return;
        if (b.dia !== otro.dia) return;
        const seSuperponen = b.horaIni < otro.horaFin && otro.horaIni < b.horaFin;
        if (seSuperponen) {
          nuevosErroresBloques[i] = { ...nuevosErroresBloques[i], horaIni: 'Se superpone con otro bloque horario del mismo día' };
        }
      });
    });

    const hayErroresBloques = nuevosErroresBloques.some(e => Object.keys(e).length > 0);

    if (!resultadoPrincipal.success || hayErroresBloques || sinBloques) {
      if (!resultadoPrincipal.success) {
        const errs: ErroresCursada = {};
        resultadoPrincipal.error.issues.forEach(issue => {
          const f = String(issue.path[0]) as keyof ErroresCursada;
          if (!errs[f]) errs[f] = issue.message;
        });
        setErrores(errs);
      }
      setErroresBloques(nuevosErroresBloques);
      setErrorBloques(sinBloques ? 'La cursada debe tener al menos un bloque horario asociado' : undefined);
      return false;
    }

    setErrores({});
    setErroresBloques(bloques.map(() => ({})));
    setErrorBloques(undefined);
    return true;
  };

  return {
    modalAbierto,
    modoEdicion,
    idEditando,
    form,
    errores,
    erroresBloques,
    errorSinBloques,
    abrirModalNuevo,
    abrirModalEdicion,
    cerrarModal,
    handleChange,
    handleBloqueChange,
    agregarBloque,
    eliminarBloque,
    validarForm,
  };
}
