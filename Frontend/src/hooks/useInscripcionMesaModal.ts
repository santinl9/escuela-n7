import { useState } from 'react';
import type { InscripcionMesa } from '../types/InscripcionMesa';
import { inscripcionMesaSchema, notaMesaSchema } from '../types/schemas/inscripcionMesaSchema';
import type { FormInscripcionMesa, ErroresInscripcionMesa } from '../types/formTypes/inscripcionMesaFormTypes';
import { formVacioInscripcionMesa } from '../constants/inscripcionMesaForm';

export function useInscripcionMesaModal() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion]   = useState(false);
  const [idEditando, setIdEditando]     = useState<number | null>(null);
  const [form, setForm]                 = useState<FormInscripcionMesa>({ ...formVacioInscripcionMesa });
  const [errores, setErrores]           = useState<ErroresInscripcionMesa>({});

  const abrirModalNuevo = () => {
    setForm({ ...formVacioInscripcionMesa });
    setErrores({});
    setModoEdicion(false);
    setIdEditando(null);
    setModalAbierto(true);
  };

  const abrirModalEdicion = (inscripcion: InscripcionMesa) => {
    setForm({
      estudianteDni: String(inscripcion.estudianteDni),
      nota: inscripcion.nota !== null ? String(inscripcion.nota) : '',
      asistio: inscripcion.asistio,
    });
    setErrores({});
    setModoEdicion(true);
    setIdEditando(inscripcion.id);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setForm({ ...formVacioInscripcionMesa });
    setErrores({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errores[name as keyof ErroresInscripcionMesa]) {
      setErrores(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleToggleAsistio = () => {
    setForm(prev => ({ ...prev, asistio: !prev.asistio }));
  };

  const validarForm = (): boolean => {
    const resultado = modoEdicion ? notaMesaSchema.safeParse(form) : inscripcionMesaSchema.safeParse(form);
    if (!resultado.success) {
      const errs: ErroresInscripcionMesa = {};
      resultado.error.issues.forEach(issue => {
        const f = String(issue.path[0]) as keyof ErroresInscripcionMesa;
        if (!errs[f]) errs[f] = issue.message;
      });
      setErrores(errs);
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
    handleToggleAsistio,
    validarForm,
  };
}
