import type { CamposPrincipales, ContactoForm, FormEstudiante } from '../types/formTypes/estudianteFormTypes';

export const contactoVacio: ContactoForm = {
  nombre: '', apellido: '', dni: '', cuil: '', email: '', telefono: '',
};

export const formVacio: FormEstudiante = {
  apellido: '', nombre: '', dni: '', cuil: '', email: '', telefono: '', fechaNacimiento: '',
  folio: '', libro: '', nacionalidad: '', calle: '', numero: '',
  contactos: [{ ...contactoVacio }],
};

export const CAMPOS_FORM: {
  label: string;
  name: CamposPrincipales;
  type: string;
  placeholder: string;
}[] = [
  { label: 'Apellido',            name: 'apellido',         type: 'text',  placeholder: 'Ej: García'         },
  { label: 'Nombre',              name: 'nombre',           type: 'text',  placeholder: 'Ej: Lucía'          },
  { label: 'DNI',                 name: 'dni',              type: 'text',  placeholder: 'Ej: 43935217'       },
  { label: 'CUIL',                name: 'cuil',             type: 'text',  placeholder: 'Ej: 27-43935217-4'  },
  { label: 'Email',               name: 'email',            type: 'email', placeholder: 'Ej: lucia@gmail.com' },
  { label: 'Teléfono',            name: 'telefono',         type: 'text',  placeholder: 'Ej: 2213456789'    },
  { label: 'Fecha de Nacimiento', name: 'fechaNacimiento',  type: 'date',  placeholder: ''                  },
  { label: 'Folio',               name: 'folio',            type: 'text',  placeholder: 'Ej: 154'           },
  { label: 'Libro',               name: 'libro',            type: 'text',  placeholder: 'Ej: 11'            },
  { label: 'Nacionalidad',        name: 'nacionalidad',     type: 'text',  placeholder: 'Ej: Argentina'     },
  { label: 'Calle',               name: 'calle',            type: 'text',  placeholder: 'Ej: Calle 25'      },
  { label: 'Número',              name: 'numero',           type: 'text',  placeholder: 'Ej: 1520'          },
];

export const CAMPOS_CONTACTO: {
  label: string;
  name: keyof ContactoForm;
  type: string;
  placeholder: string;
}[] = [
  { label: 'Nombre',   name: 'nombre',   type: 'text',  placeholder: 'Ej: María'           },
  { label: 'Apellido', name: 'apellido', type: 'text',  placeholder: 'Ej: González'         },
  { label: 'DNI',      name: 'dni',      type: 'text',  placeholder: 'Ej: 30123456'        },
  { label: 'CUIL',     name: 'cuil',     type: 'text',  placeholder: 'Ej: 27-12345678-9'   },
  { label: 'Email',    name: 'email',    type: 'email', placeholder: 'Ej: maria@gmail.com' },
  { label: 'Teléfono', name: 'telefono', type: 'text',  placeholder: 'Ej: 221-387-5824'    },
];
