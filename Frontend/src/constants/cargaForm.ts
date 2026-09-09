import type { FormCarga } from '../types/formTypes/cargaFormTypes';
import type { NotaValorativa } from '../types/CargaValorativa';

export const formVacioCarga: FormCarga = {
  calificacion: '',
  inasistencias: '',
};

export const NOTAS_VALORATIVAS_OPCIONES: NotaValorativa[] = ['TEA', 'TEP', 'TED'];
