import { useState } from 'react';
import type { Aula } from '../types/Aula';
import { aulaSchema } from '../types/schemas/aulaSchema';
import type { FormAula, ErroresAula } from '../types/formTypes/aulaFormTypes';
import { formVacioAula } from '../constants/aulaForm';

export function useAulaModal() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion]   = useState(false);
  const [idEditando, setIdEditando]     = useState<number | null>(null);
  const [form, setForm]                 = useState<FormAula>({ ...formVacioAula });
  const [errores, setErrores]           = useState<ErroresAula>({});

  const abrirModalNuevo = () => {
    setForm({ ...formVacioAula });
    setErrores({});
    setModoEdicion(false);
    setIdEditando(null);
    setModalAbierto(true);
  };

  const abrirModalEdicion = (aula: Aula) => {
    setForm({ nombre: aula.nombre, capacidad: String(aula.capacidad) });
    setErrores({});
    setModoEdicion(true);
    setIdEditando(aula.id);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setForm({ ...formVacioAula });
    setErrores({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errores[name as keyof ErroresAula]) {
      setErrores(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validarForm = (aulasExistentes: Aula[] = []): boolean => {
    const resultado = aulaSchema.safeParse(form);
    if (!resultado.success) {
      const errs: ErroresAula = {};
      resultado.error.issues.forEach(issue => {
        const f = String(issue.path[0]) as keyof ErroresAula;
        if (!errs[f]) errs[f] = issue.message;
      });
      setErrores(errs);
      return false;
    }

    const yaExiste = aulasExistentes.some(a =>
      a.id !== idEditando && a.nombre.trim().toLowerCase() === form.nombre.trim().toLowerCase()
    );
    if (yaExiste) {
      setErrores({ nombre: 'Ya existe un aula con este nombre' });
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
