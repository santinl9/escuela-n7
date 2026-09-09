import { useState } from 'react';
import type { MesasDeExamen } from '../types/MesasDeExamen';
import { mesaExamenSchema } from '../types/schemas/mesaExamenSchema';
import type { FormMesaExamen, ErroresMesaExamen } from '../types/formTypes/mesaExamenFormTypes';
import { formVacioMesaExamen } from '../constants/mesaExamenForm';

export function useMesaExamenModal() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion]   = useState(false);
  const [idEditando, setIdEditando]     = useState<number | null>(null);
  const [form, setForm]                 = useState<FormMesaExamen>({ ...formVacioMesaExamen });
  const [errores, setErrores]           = useState<ErroresMesaExamen>({});

  const abrirModalNuevo = () => {
    setForm({ ...formVacioMesaExamen });
    setErrores({});
    setModoEdicion(false);
    setIdEditando(null);
    setModalAbierto(true);
  };

  const abrirModalEdicion = (mesa: MesasDeExamen) => {
    setForm({
      materiaId:  String(mesa.materiaId),
      personalId: mesa.personalId,
      fecha:      mesa.fecha,
      hora:       mesa.hora,
      cupo:       String(mesa.cupo),
    });
    setErrores({});
    setModoEdicion(true);
    setIdEditando(mesa.id);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setForm({ ...formVacioMesaExamen });
    setErrores({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errores[name as keyof ErroresMesaExamen]) {
      setErrores(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // `esDocenteDisponible` valida que el personal elegido tenga cargo de Profesor (la lista de
  // opciones del modal ya filtra por esto, pero se revalida acá por consistencia).
  const validarForm = (esDocenteDisponible: (personalId: string, fecha: string) => boolean): boolean => {
    const resultado = mesaExamenSchema.safeParse(form);
    if (!resultado.success) {
      const errs: ErroresMesaExamen = {};
      resultado.error.issues.forEach(issue => {
        const f = String(issue.path[0]) as keyof ErroresMesaExamen;
        if (!errs[f]) errs[f] = issue.message;
      });
      setErrores(errs);
      return false;
    }

    if (!esDocenteDisponible(form.personalId, form.fecha)) {
      setErrores({ personalId: 'El docente elegido debe tener cargo de Profesor' });
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
