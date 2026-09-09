import { useState } from 'react';
import type { Materia } from '../types/Materia';
import { materiaSchema } from '../types/schemas/materiaSchema';
import type { FormMateria, ErroresMateria } from '../types/formTypes/materiaFormTypes';
import { formVacioMateria } from '../constants/materiaForm';

export function useMateriaModal() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion]   = useState(false);
  const [idEditando, setIdEditando]     = useState<number | null>(null);
  const [form, setForm]                 = useState<FormMateria>({ ...formVacioMateria });
  const [errores, setErrores]           = useState<ErroresMateria>({});

  const abrirModalNuevo = () => {
    setForm({ ...formVacioMateria });
    setErrores({});
    setModoEdicion(false);
    setIdEditando(null);
    setModalAbierto(true);
  };

  const abrirModalEdicion = (mat: Materia) => {
    setForm({ nombre: mat.nombre, nivel: String(mat.nivel), curricular: mat.curricular ? 'Curricular' : 'Extracurricular' });
    setErrores({});
    setModoEdicion(true);
    setIdEditando(mat.id);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setForm({ ...formVacioMateria });
    setErrores({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errores[name as keyof ErroresMateria]) {
      setErrores(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validarForm = (materiasExistentes: Materia[] = []): boolean => {
    const resultado = materiaSchema.safeParse(form);
    if (!resultado.success) {
      const errs: ErroresMateria = {};
      resultado.error.issues.forEach(issue => {
        const f = String(issue.path[0]) as keyof ErroresMateria;
        if (!errs[f]) errs[f] = issue.message;
      });
      setErrores(errs);
      return false;
    }

    const yaExiste = materiasExistentes.some(mat =>
      mat.id !== idEditando &&
      mat.nombre.trim().toLowerCase() === form.nombre.trim().toLowerCase() &&
      mat.nivel === Number(form.nivel)
    );
    if (yaExiste) {
      setErrores({ nombre: 'Ya existe una materia con este nombre en este nivel' });
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
