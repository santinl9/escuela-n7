import { useState } from 'react';
import type { PeriodoCarga } from '../types/PeriodoCarga';
import { periodoCargaSchema } from '../types/schemas/periodoCargaSchema';
import type { FormPeriodoCarga, ErroresPeriodoCarga } from '../types/formTypes/periodoCargaFormTypes';
import { formVacioPeriodoCarga } from '../constants/periodoCargaForm';

export function usePeriodoCargaModal() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion]   = useState(false);
  const [idEditando, setIdEditando]     = useState<number | null>(null);
  const [form, setForm]                 = useState<FormPeriodoCarga>({ ...formVacioPeriodoCarga });
  const [errores, setErrores]           = useState<ErroresPeriodoCarga>({});

  const abrirModalNuevo = () => {
    setForm({ ...formVacioPeriodoCarga });
    setErrores({});
    setModoEdicion(false);
    setIdEditando(null);
    setModalAbierto(true);
  };

  const abrirModalEdicion = (periodo: PeriodoCarga) => {
    setForm({
      descripcion: periodo.descripcion,
      tipo:        periodo.tipo,
      fechaIni:    periodo.fechaIni,
      fechaFin:    periodo.fechaFin,
    });
    setErrores({});
    setModoEdicion(true);
    setIdEditando(periodo.id);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setForm({ ...formVacioPeriodoCarga });
    setErrores({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errores[name as keyof ErroresPeriodoCarga]) {
      setErrores(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Dos períodos de carga del mismo ciclo lectivo no pueden coexistir en el tiempo.
  const validarForm = (periodosExistentes: PeriodoCarga[] = []): boolean => {
    const resultado = periodoCargaSchema.safeParse(form);
    if (!resultado.success) {
      const errs: ErroresPeriodoCarga = {};
      resultado.error.issues.forEach(issue => {
        const f = String(issue.path[0]) as keyof ErroresPeriodoCarga;
        if (!errs[f]) errs[f] = issue.message;
      });
      setErrores(errs);
      return false;
    }

    const seSuperpone = periodosExistentes.some(p =>
      p.id !== idEditando && form.fechaIni <= p.fechaFin && p.fechaIni <= form.fechaFin
    );
    if (seSuperpone) {
      setErrores({ fechaIni: 'Se superpone con otro período de carga existente' });
      return false;
    }

    setErrores({});
    return true;
  };

  return {
    modalAbierto,
    modoEdicion,
    idEditando,
    form,
    errores,
    abrirModalNuevo,
    abrirModalEdicion,
    cerrarModal,
    handleChange,
    validarForm,
  };
}
