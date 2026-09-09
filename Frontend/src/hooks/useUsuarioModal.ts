import { useState } from 'react';
import type { Usuario } from '../types/Usuario';
import type { Personal } from '../types/Personal';
import { usuarioSchema } from '../types/schemas/usuarioSchema';
import type { FormUsuario, ErroresUsuario } from '../types/formTypes/usuarioFormTypes';
import { FORM_USUARIO_VACIO } from '../constants/usuarioForm';

export function useUsuarioModal() {
  const [modalAbierto,    setModalAbierto]    = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<string | null>(null);
  const [form,            setForm]            = useState<FormUsuario>(FORM_USUARIO_VACIO);
  const [errores,         setErrores]         = useState<ErroresUsuario>({});

  const abrirModalEdicion = (user: Usuario, personal: Personal) => {
    setUsuarioEditando(user.id);
    setForm({
      apellido: personal.apellido,
      nombre:   personal.nombre,
      dni:      String(personal.dni),
      roles:    user.roles.length > 0 ? [...user.roles] : [''],
    });
    setErrores({});
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setForm(FORM_USUARIO_VACIO);
    setErrores({});
  };

  const handleRolChange = (idx: number, nombreRol: string) => {
    setForm(prev => ({ ...prev, roles: prev.roles.map((r, i) => (i === idx ? nombreRol : r)) }));
    if (errores.roles) {
      setErrores(prev => ({ ...prev, roles: undefined }));
    }
  };

  const agregarRol = () => {
    setForm(prev => ({ ...prev, roles: [...prev.roles, ''] }));
  };

  const eliminarRol = (idx: number) => {
    setForm(prev => ({ ...prev, roles: prev.roles.filter((_, i) => i !== idx) }));
  };

  const validarForm = (): boolean => {
    const resultado = usuarioSchema.safeParse(form);

    if (resultado.success) {
      setErrores({});
      return true;
    }

    const errs: ErroresUsuario = {};
    resultado.error.issues.forEach(issue => {
      const campo = String(issue.path[0]) as keyof ErroresUsuario;
      if (!errs[campo]) errs[campo] = issue.message;
    });
    setErrores(errs);
    return false;
  };

  return {
    modalAbierto,
    usuarioEditando,
    form,
    errores,
    abrirModalEdicion,
    cerrarModal,
    handleRolChange,
    agregarRol,
    eliminarRol,
    validarForm,
  };
}
