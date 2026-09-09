import { createContext, useContext } from 'react';
import type { Usuario } from '../types/Usuario';
import type { Personal } from '../types/Personal';

export interface AuthContextValue {
  usuarioActual: Usuario | null;
  personalActual: Personal | null;
  personalIdActual: string | null;
  login: (usuario: Usuario, personal: Personal) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  usuarioActual: null,
  personalActual: null,
  personalIdActual: null,
  login: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}
