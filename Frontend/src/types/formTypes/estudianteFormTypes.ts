export const formatCuil = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
};

export type ContactoForm = {
  nombre: string;
  apellido: string;
  dni: string;
  cuil: string;
  email: string;
  telefono: string;
};

export type CamposPrincipales =
  | 'apellido' | 'nombre' | 'dni' | 'cuil' | 'email' | 'telefono' | 'fechaNacimiento'
  | 'folio' | 'libro' | 'nacionalidad' | 'calle' | 'numero';

export type FormEstudiante = Record<CamposPrincipales, string> & {
  contactos: ContactoForm[];
};

export type ErroresPrincipales = Partial<Record<CamposPrincipales, string>>;
export type ErroresContacto    = Partial<Record<keyof ContactoForm, string>>; 
  // keyof ( nombre: string; apellido: string; ) ->  'nombre' | 'apellido'
  //Record<'nombre' | 'apellido' , string> = { nombre: string; apellido: string }
  //se utilza para convertir los campos en string

