export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  estado: 'Activo' | 'Inactivo';
}

export interface Permiso {
  id: string;
  modulo: string;
  descripcion: string;
  rolesAsignados: string[];
}

export interface RolesYUsuariosProps {
  // Por si el contenedor principal o la ruta necesitan pasarle datos iniciales
  usuariosIniciales?: Usuario[];
  permisosIniciales?: Permiso[];
}