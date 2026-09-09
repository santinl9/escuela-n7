import { useState } from 'react';
import type { CicloLectivo } from '../types/CicloLectivo';
import { cicloLectivoSchema } from '../types/schemas/cicloLectivoSchema';
import type { FormCicloLectivo, ErroresCicloLectivo } from '../types/formTypes/cicloLectivoFormTypes';
import { formVacioCicloLectivo } from '../constants/cicloLectivoForm';

export function useCicloLectivoModal() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion]   = useState(false);
  const [idEditando, setIdEditando]     = useState<number | null>(null);
  const [form, setForm]                 = useState<FormCicloLectivo>({ ...formVacioCicloLectivo });
  const [errores, setErrores]           = useState<ErroresCicloLectivo>({});

  const abrirModalNuevo = () => {
    setForm({ ...formVacioCicloLectivo });
    setErrores({});
    setModoEdicion(false);
    setIdEditando(null);
    setModalAbierto(true);
  };

  const abrirModalEdicion = (ciclo: CicloLectivo) => {
    setForm({ fechaIni: ciclo.fechaIni, fechaFin: ciclo.fechaFin });
    setErrores({});
    setModoEdicion(true);
    setIdEditando(ciclo.id);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setForm({ ...formVacioCicloLectivo });
    setErrores({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errores[name as keyof ErroresCicloLectivo]) {
      setErrores(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Dos ciclos lectivos no pueden coexistir en el tiempo.
  const validarForm = (ciclosExistentes: CicloLectivo[] = []): boolean => {
    const resultado = cicloLectivoSchema.safeParse(form);
    if (!resultado.success) {
      const errs: ErroresCicloLectivo = {};
      resultado.error.issues.forEach(issue => {
        const f = String(issue.path[0]) as keyof ErroresCicloLectivo;
        if (!errs[f]) errs[f] = issue.message;
      });
      setErrores(errs);
      return false;
    }

    const seSuperpone = ciclosExistentes.some(c =>
      c.id !== idEditando && form.fechaIni <= c.fechaFin && c.fechaIni <= form.fechaFin
    );
    if (seSuperpone) {
      setErrores({ fechaIni: 'Se superpone con otro ciclo lectivo existente' });
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
