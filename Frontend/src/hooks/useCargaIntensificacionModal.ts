import { useState } from 'react';
import type { CargaIntensificacion } from '../types/CargaIntensificacion';
import { cargaIntensificacionSchema } from '../types/schemas/cargaIntensificacionSchema';
import type { FormCargaIntensificacion, ErroresCargaIntensificacion } from '../types/formTypes/cargaIntensificacionFormTypes';
import { formVacioCargaIntensificacion } from '../constants/cargaIntensificacionForm';

export function useCargaIntensificacionModal() {
  const [modalAbierto, setModalAbierto]     = useState(false);
  const [inscripcionId, setInscripcionId]   = useState<number | null>(null);
  const [form, setForm]                     = useState<FormCargaIntensificacion>({ ...formVacioCargaIntensificacion });
  const [errores, setErrores]               = useState<ErroresCargaIntensificacion>({});

  // Si ya existe una carga de intensificación para esta inscripción en el período vigente,
  // se abre precargada (edición); si no, arranca vacía.
  const abrirModal = (idInscripcion: number, cargaExistente?: CargaIntensificacion) => {
    setForm(
      cargaExistente
        ? { calificacionFinal: String(cargaExistente.calificacionFinal) }
        : { ...formVacioCargaIntensificacion }
    );
    setErrores({});
    setInscripcionId(idInscripcion);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setInscripcionId(null);
    setForm({ ...formVacioCargaIntensificacion });
    setErrores({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errores[name as keyof ErroresCargaIntensificacion]) {
      setErrores(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validarForm = (): boolean => {
    const resultado = cargaIntensificacionSchema.safeParse(form);
    if (!resultado.success) {
      const errs: ErroresCargaIntensificacion = {};
      resultado.error.issues.forEach(issue => {
        const f = String(issue.path[0]) as keyof ErroresCargaIntensificacion;
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
    inscripcionId,
    form,
    errores,
    abrirModal,
    cerrarModal,
    handleChange,
    validarForm,
  };
}
