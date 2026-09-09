export type FormUsuario = {
  apellido: string;
  nombre:   string;
  dni:      string;
  roles:    string[];
};

export type ErroresUsuario = Partial<Record<'roles', string>>;
