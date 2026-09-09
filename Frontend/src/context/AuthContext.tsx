import { useState, type ReactNode } from 'react';
import { AuthContext } from '../hooks/useAuth';
import type { Usuario } from '../types/Usuario';
import type { Personal } from '../types/Personal';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [personalActual, setPersonalActual] = useState<Personal | null>(null);

  const personalIdActual = usuarioActual?.personalId ?? null;

  const login = (usuario: Usuario, personal: Personal) => {
    setUsuarioActual(usuario);
    setPersonalActual(personal);
  };

  const logout = () => {
    setUsuarioActual(null);
    setPersonalActual(null);
  };

  return (
    <AuthContext.Provider value={{ usuarioActual, personalActual, personalIdActual, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
