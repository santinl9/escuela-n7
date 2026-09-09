import { useState } from 'react';
import type { Orientacion } from '../types/Orientacion';
import { orientacionSchema } from '../types/schemas/orientacionSchema';
import type { FormOrientacion, ErroresOrientacion } from '../types/formTypes/orientacionFormTypes';
import { formVacioOrientacion } from '../constants/orientacionForm';

export function useOrientacionModal() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion]   = useState(false);
  const [idEditando, setIdEditando]     = useState<number | null>(null);
  const [form, setForm]                 = useState<FormOrientacion>({ ...formVacioOrientacion });
  const [errores, setErrores]           = useState<ErroresOrientacion>({});

  const abrirModalNuevo = () => {
    setForm({ ...formVacioOrientacion });
    setErrores({});
    setModoEdicion(false);
    setIdEditando(null);
    setModalAbierto(true);
  };

  const abrirModalEdicion = (esp: Orientacion) => {
    setForm({ nombre: esp.nombre });
    setErrores({});
    setModoEdicion(true);
    setIdEditando(esp.id);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setForm({ ...formVacioOrientacion });
    setErrores({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errores[name as keyof ErroresOrientacion]) {
      setErrores(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validarForm = (orientacionesExistentes: Orientacion[] = []): boolean => {
    const resultado = orientacionSchema.safeParse(form);
    if (!resultado.success) {
      const errs: ErroresOrientacion = {};
      resultado.error.issues.forEach(issue => {
        const f = String(issue.path[0]) as keyof ErroresOrientacion;
        if (!errs[f]) errs[f] = issue.message;
      });
      setErrores(errs);
      return false;
    }

    const yaExiste = orientacionesExistentes.some(esp =>
      esp.id !== idEditando && esp.nombre.trim().toLowerCase() === form.nombre.trim().toLowerCase()
    );
    if (yaExiste) {
      setErrores({ nombre: 'Ya existe una orientación con este nombre' });
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
