import { useState } from 'react';
import type { Curso } from '../types/Curso';
import { cursoSchema } from '../types/schemas/cursoSchema';
import type { FormCurso, ErroresCurso } from '../types/formTypes/cursoFormTypes';
import { formVacioCurso, NIVELES_CON_ORIENTACION } from '../constants/cursoForm';

export function useCursoModal() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion]   = useState(false);
  const [idEditando, setIdEditando]     = useState<number | null>(null);
  const [form, setForm]                 = useState<FormCurso>({ ...formVacioCurso });
  const [errores, setErrores]           = useState<ErroresCurso>({});

  const abrirModalNuevo = () => {
    setForm({ ...formVacioCurso });
    setErrores({});
    setModoEdicion(false);
    setIdEditando(null);
    setModalAbierto(true);
  };

  const abrirModalEdicion = (curso: Curso) => {
    setForm({
      nivel: String(curso.nivel),
      nombre: curso.nombre,
      turno: curso.turno,
      orientacionId: curso.orientacionId !== undefined ? String(curso.orientacionId) : '',
    });
    setErrores({});
    setModoEdicion(true);
    setIdEditando(curso.id);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setForm({ ...formVacioCurso });
    setErrores({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
      // Si el nivel deja de ser 4to-6to, la orientación seleccionada deja de aplicar.
      if (name === 'nivel' && !NIVELES_CON_ORIENTACION.includes(Number(value))) {
        next.orientacionId = '';
      }
      return next;
    });
    if (errores[name as keyof ErroresCurso]) {
      setErrores(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validarForm = (cursosExistentes: Curso[] = []): boolean => {
    const resultado = cursoSchema.safeParse(form);
    if (!resultado.success) {
      const errs: ErroresCurso = {};
      resultado.error.issues.forEach(issue => {
        const f = String(issue.path[0]) as keyof ErroresCurso;
        if (!errs[f]) errs[f] = issue.message;
      });
      setErrores(errs);
      return false;
    }

    const yaExiste = cursosExistentes.some(c =>
      c.id !== idEditando &&
      c.nivel === Number(form.nivel) &&
      c.nombre.toUpperCase() === form.nombre.toUpperCase()
    );
    if (yaExiste) {
      setErrores({ nombre: 'Ya existe un curso con este nivel y división' });
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
