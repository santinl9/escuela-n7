import { useState } from 'react';
import type { Estudiante } from '../types/Estudiante';
import type { ContactoEmergencia } from '../types/ContactoEmergencia';
import type { Domicilio } from '../types/Domicilio';
import { estudianteSchema, contactoEmergenciaSchema } from '../types/schemas/estudianteSchema';
import type {
  FormEstudiante,
  ErroresPrincipales,
  ErroresContacto,
  ContactoForm,
} from '../types/formTypes/estudianteFormTypes';
import { contactoVacio, formVacio } from '../constants/estudianteForm';
import { formatCuil } from '../types/formTypes/estudianteFormTypes';

export function useEstudianteModal() {
  const [modalAbierto, setModalAbierto]         = useState(false);
  const [modoEdicion, setModoEdicion]           = useState(false);
  const [idEditando, setIdEditando]             = useState<number | null>(null);
  const [form, setForm]                         = useState<FormEstudiante>(formVacio);
  const [errores, setErrores]                   = useState<ErroresPrincipales>({});
  const [erroresContactos, setErroresContactos] = useState<ErroresContacto[]>([{}]);

  const abrirModalEdicion = (est: Estudiante, contactosExistentes: ContactoEmergencia[], domicilioExistente?: Domicilio) => {
    const contactos = contactosExistentes.length > 0
      ? contactosExistentes.map(c => ({ nombre: c.nombre, apellido: c.apellido, dni: String(c.dni), cuil: c.cuil, email: c.email, telefono: String(c.telefono) }))
      : [{ ...contactoVacio }];
    setForm({
      apellido:         est.apellido,
      nombre:           est.nombre,
      dni:              String(est.dni),
      cuil:             est.cuil,
      email:            est.email,
      telefono:         String(est.telefono),
      fechaNacimiento:  est.fechaNacimiento,
      folio:            String(est.folio),
      libro:            String(est.libro),
      nacionalidad:     est.nacionalidad,
      calle:            domicilioExistente?.calle ?? '',
      numero:           domicilioExistente ? String(domicilioExistente.numero) : '',
      contactos,
    });
    setErrores({});
    setErroresContactos(contactos.map(() => ({})));
    setModoEdicion(true);
    setIdEditando(est.id);
    setModalAbierto(true);
  };

  const abrirModalNuevo = () => {
    setForm({ ...formVacio, contactos: [{ ...contactoVacio }] });
    setErrores({});
    setErroresContactos([{}]);
    setModoEdicion(false);
    setIdEditando(null);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setForm({ ...formVacio, contactos: [{ ...contactoVacio }] });
    setErrores({});
    setErroresContactos([{}]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formatted = name === 'cuil' ? formatCuil(value) : value;
    setForm(prev => ({ ...prev, [name]: formatted }));
    if (errores[name as keyof ErroresPrincipales]) {
      setErrores(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleContactoChange = (idx: number, campo: keyof ContactoForm, valor: string) => {
    const formatted = campo === 'cuil' ? formatCuil(valor) : valor;
    setForm(prev => {
      const contactos = [...prev.contactos];
      contactos[idx] = { ...contactos[idx], [campo]: formatted };
      return { ...prev, contactos };
    });
    setErroresContactos(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [campo]: undefined };
      return next;
    });
  };

  const agregarContacto = () => {
    setForm(prev => ({ ...prev, contactos: [...prev.contactos, { ...contactoVacio }] }));
    setErroresContactos(prev => [...prev, {}]);
  };

  const eliminarContacto = (idx: number) => {
    setForm(prev => ({ ...prev, contactos: prev.contactos.filter((_, i) => i !== idx) }));
    setErroresContactos(prev => prev.filter((_, i) => i !== idx));
  };

  const validarForm = (estudiantesExistentes: Estudiante[] = []): boolean => {
    const { contactos, ...camposPrincipales } = form;
    const resultadoPrincipal = estudianteSchema.safeParse(camposPrincipales);

    const errs: ErroresPrincipales = {};
    if (!resultadoPrincipal.success) {
      resultadoPrincipal.error.issues.forEach(issue => {
        const f = String(issue.path[0]) as keyof ErroresPrincipales;
        if (!errs[f]) errs[f] = issue.message;
      });
    }
    if (!errs.dni) {
      const dniDuplicado = estudiantesExistentes.some(est =>
        est.id !== idEditando && est.dni === Number(form.dni)
      );
      if (dniDuplicado) errs.dni = 'Ya existe un estudiante con este DNI';
    }
    if (!errs.cuil) {
      const cuilDuplicado = estudiantesExistentes.some(est =>
        est.id !== idEditando && est.cuil === form.cuil
      );
      if (cuilDuplicado) errs.cuil = 'Ya existe un estudiante con este CUIL';
    }
    if (!errs.folio && !errs.libro) {
      const folioLibroDuplicado = estudiantesExistentes.some(est =>
        est.id !== idEditando && est.folio === Number(form.folio) && est.libro === Number(form.libro)
      );
      if (folioLibroDuplicado) {
        errs.folio = 'Ya existe un estudiante con esta combinación de folio y libro';
        errs.libro = 'Ya existe un estudiante con esta combinación de folio y libro';
      }
    }

    const nuevosErroresContactos: ErroresContacto[] = contactos.map(c => {
      const res = contactoEmergenciaSchema.safeParse(c);
      const errsContacto: ErroresContacto = {};
      if (!res.success) {
        res.error.issues.forEach(issue => {
          const f = String(issue.path[0]) as keyof ContactoForm;
          if (!errsContacto[f]) errsContacto[f] = issue.message;
        });
      }
      return errsContacto;
    });

    // El DNI y el CUIL de un contacto no pueden coincidir con los del estudiante ni con los de otro contacto del mismo estudiante.
    contactos.forEach((c, idx) => {
      if (!nuevosErroresContactos[idx].dni && c.dni) {
        if (c.dni === form.dni) {
          nuevosErroresContactos[idx].dni = 'El DNI del contacto no puede ser igual al del estudiante';
        } else if (contactos.some((otro, otroIdx) => otroIdx !== idx && otro.dni === c.dni)) {
          nuevosErroresContactos[idx].dni = 'Los DNIs de los contactos de emergencia deben ser distintos entre sí';
        }
      }

      if (!nuevosErroresContactos[idx].cuil && c.cuil) {
        if (c.cuil === form.cuil) {
          nuevosErroresContactos[idx].cuil = 'El CUIL del contacto no puede ser igual al del estudiante';
        } else if (contactos.some((otro, otroIdx) => otroIdx !== idx && otro.cuil === c.cuil)) {
          nuevosErroresContactos[idx].cuil = 'Los CUILs de los contactos de emergencia deben ser distintos entre sí';
        }
      }
    });

    const hayErroresContactos = nuevosErroresContactos.some(e => Object.keys(e).length > 0);
    const hayErroresPrincipales = Object.keys(errs).length > 0;

    if (hayErroresPrincipales || hayErroresContactos) {
      setErrores(errs);
      setErroresContactos(nuevosErroresContactos);
      return false;
    }

    setErrores({});
    setErroresContactos(contactos.map(() => ({})));
    return true;
  };

  return {
    modalAbierto,
    modoEdicion,
    idEditando,
    form,
    errores,
    erroresContactos,
    abrirModalEdicion,
    abrirModalNuevo,
    cerrarModal,
    handleChange,
    handleContactoChange,
    agregarContacto,
    eliminarContacto,
    validarForm,
  };
}
