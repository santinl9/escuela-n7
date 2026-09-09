import { useState, useRef, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { TOAST } from '../../constants/toastMessages';
import type { ErroresBloqueLibre, FormPersonal, ErroresPrincipalesPersonal, ErroresHorario, HorarioForm } from '../../types/formTypes/personalFormTypes';
import type { OpcionConLabel } from '../../types/OpcionConLabel';
import { TIPO_CARGO_OPCIONES } from '../../constants/cargoJerarquia';
import { SITUACION_REVISTA_OPCIONES } from '../../constants/personalForm';
import { DIAS_SEMANA_OPCIONES } from '../../constants/bloqueHorarioForm';
import { normalizarBusqueda as norm } from '../../constants/normalizarTexto';

type CamposEscalaresHorario = 'tipoCargo' | 'situacionRevista' | 'fechaIni' | 'fechaFin';

interface PersonalModalProps {
  modoEdicion: boolean;
  form: FormPersonal;
  errores: ErroresPrincipalesPersonal;
  erroresHorarios: ErroresHorario[];
  erroresBloquesLibres: ErroresBloqueLibre[][];
  cursadaOpciones: (horario: HorarioForm) => OpcionConLabel[];
  cursoOpciones: OpcionConLabel[];
  onClose: () => void;
  onGuardar: () => void;
  onChange: (campo: keyof Omit<FormPersonal, 'horarios'>, valor: string) => void;
  onHorarioChange: (idx: number, campo: CamposEscalaresHorario, valor: string) => void;
  onAgregarHorario: () => void;
  onEliminarHorario: (idx: number) => void;
  onCursadaDeHorarioChange: (idx: number, valor: string) => void;
  onToggleCursoHorario: (idx: number, cursoId: number) => void;
  onBloqueLibreChange: (horarioIdx: number, bloqueIdx: number, campo: 'horaIni' | 'horaFin', valor: string) => void;
  onDiasBloqueLibreChange: (horarioIdx: number, bloqueIdx: number, dias: string[]) => void;
  onAgregarBloqueLibre: (horarioIdx: number) => void;
  onEliminarBloqueLibre: (horarioIdx: number, bloqueIdx: number) => void;
}

interface DropdownCampoProps {
  label: string;
  valor: string;
  opciones: string[];
  placeholder: string;
  error?: string;
  onSelect: (valor: string) => void;
}

function DropdownCampo({ label, valor, opciones, placeholder, error, onSelect }: DropdownCampoProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-label text-label-md text-on-surface-variant">{label}</label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(prev => !prev)}
          style={{ backgroundColor: 'var(--background)' }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border font-body text-body-sm text-left focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 cursor-pointer ${
            error ? 'border-error' : 'border-outline-variant'
          }`}
        >
          <span style={{ color: valor ? 'var(--on-surface)' : 'var(--on-surface-variant)' }}>
            {valor || placeholder}
          </span>
          <span className={`material-symbols-outlined text-on-surface-variant text-[1.1rem] leading-none transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        <div
          className={`absolute z-20 left-0 right-0 mt-1 bg-background border border-outline-variant rounded-lg shadow-md transition-opacity duration-150 ease-in-out ${
            open ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
        >
          <ul className="max-h-48 overflow-y-auto scrollbar-custom">
            {opciones.map(o => (
              <li key={o}>
                <button
                  type="button"
                  onClick={() => { onSelect(o); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer ${
                    valor === o ? 'bg-secondary-container text-on-secondary-container font-semibold' : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {o}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {error && <p className="font-body text-xs text-error">{error}</p>}
    </div>
  );
}

interface ComboBoxOpcionesProps {
  label: string;
  valor: string;
  opciones: OpcionConLabel[];
  placeholder: string;
  sinResultadosTexto: string;
  error?: string;
  onSelect: (valor: string) => void;
}

// Combobox con búsqueda en tiempo real — mismo patrón que "Docente a cargo" en MesaExamenModal.
function ComboBoxOpciones({ label, valor, opciones, placeholder, sinResultadosTexto, error, onSelect }: ComboBoxOpcionesProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState(() => opciones.find(o => String(o.id) === valor)?.label ?? '');

  const cerrarDropdown = () => {
    setOpen(false);
    const actual = opciones.find(o => String(o.id) === valor);
    setQuery(actual ? actual.label : '');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cerrarDropdown();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opciones, valor]);

  const opcionesFiltradas = opciones.filter(o => norm(o.label).includes(norm(query)));

  const seleccionar = (o: OpcionConLabel) => {
    onSelect(String(o.id));
    setQuery(o.label);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5 sm:col-span-2">
      <label className="font-label text-label-md text-on-surface-variant">{label}</label>
      <div ref={ref} className="relative">
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
          className={`w-full pl-3 pr-9 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${
            error ? 'border-error' : 'border-outline-variant'
          }`}
        />
        <span className={`material-symbols-outlined text-on-surface-variant text-[1.1rem] leading-none absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          expand_more
        </span>

        <div
          className={`absolute z-20 left-0 right-0 mt-1 bg-background border border-outline-variant rounded-lg shadow-md transition-opacity duration-150 ease-in-out ${
            open ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
        >
          <ul className="max-h-48 overflow-y-auto scrollbar-custom">
            {opcionesFiltradas.length === 0 ? (
              <li className="px-3 py-2 font-body text-body-sm text-on-surface-variant">{sinResultadosTexto}</li>
            ) : (
              opcionesFiltradas.map(o => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => seleccionar(o)}
                    className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer ${
                      valor === String(o.id) ? 'bg-secondary-container text-on-secondary-container font-semibold' : 'text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    {o.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
      {error && <p className="font-body text-xs text-error">{error}</p>}
    </div>
  );
}

interface ComboBoxMultipleProps {
  label: string;
  valores: number[];
  opciones: OpcionConLabel[];
  placeholder: string;
  sinResultadosTexto: string;
  error?: string;
  onToggle: (id: number) => void;
}

// Combobox con búsqueda en tiempo real, variante multi-selección: mismo patrón que
// ComboBoxOpciones, pero los elegidos se acumulan como chips en vez de reemplazar el texto.
function ComboBoxMultiple({ label, valores, opciones, placeholder, sinResultadosTexto, error, onToggle }: ComboBoxMultipleProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const seleccionadas = opciones.filter(o => valores.includes(Number(o.id)));
  const disponibles = opciones.filter(o => !valores.includes(Number(o.id)));
  const opcionesFiltradas = disponibles.filter(o => norm(o.label).includes(norm(query)));

  const seleccionar = (o: OpcionConLabel) => {
    onToggle(Number(o.id));
    setQuery('');
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-label text-label-md text-on-surface-variant">{label}</label>

      {seleccionadas.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {seleccionadas.map(o => (
            <div
              key={o.id}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-surface-container border border-outline-variant"
            >
              <span className="font-body text-body-sm text-on-surface">{o.label}</span>
              <button
                type="button"
                onClick={() => onToggle(Number(o.id))}
                className="cursor-pointer p-1 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors duration-150"
                title="Quitar"
              >
                <span className="material-symbols-outlined text-[1.1rem] leading-none">close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <div ref={ref} className="relative">
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
          className={`w-full pl-3 pr-9 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${
            error ? 'border-error' : 'border-outline-variant'
          }`}
        />
        <span className={`material-symbols-outlined text-on-surface-variant text-[1.1rem] leading-none absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          expand_more
        </span>

        <div
          className={`absolute z-20 left-0 right-0 mt-1 bg-background border border-outline-variant rounded-lg shadow-md transition-opacity duration-150 ease-in-out ${
            open ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
        >
          <ul className="max-h-48 overflow-y-auto scrollbar-custom">
            {opcionesFiltradas.length === 0 ? (
              <li className="px-3 py-2 font-body text-body-sm text-on-surface-variant">{sinResultadosTexto}</li>
            ) : (
              opcionesFiltradas.map(o => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => seleccionar(o)}
                    className="w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer text-on-surface hover:bg-surface-container-high"
                  >
                    {o.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
      {error && <p className="font-body text-xs text-error">{error}</p>}
    </div>
  );
}

interface SelectorDiasProps {
  valores: string[];
  error?: string;
  onChange: (dias: string[]) => void;
}

// Selección de días de un bloque libre: días sueltos (chips) o "Todos los días" de un saque,
// para no tener que cargar un bloque horario por cada día de quienes trabajan todos los días
// al mismo horario.
function SelectorDias({ valores, error, onChange }: SelectorDiasProps) {
  const toggleDia = (dia: string) => {
    onChange(valores.includes(dia) ? valores.filter(d => d !== dia) : [...valores, dia]);
  };

  return (
    <div className="flex flex-col gap-2 sm:col-span-3">
      <label className="font-label text-label-md text-on-surface-variant">Días</label>

      <div className="flex flex-wrap gap-1.5">
        {DIAS_SEMANA_OPCIONES.map(dia => (
          <button
            key={dia}
            type="button"
            onClick={() => toggleDia(dia)}
            className={`cursor-pointer px-2.5 py-1 rounded-full border font-label text-xs transition-colors duration-150 ${
              valores.includes(dia)
                ? 'bg-secondary-container text-on-secondary-container border-secondary-container font-semibold'
                : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {dia}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(DIAS_SEMANA_OPCIONES)}
          className="cursor-pointer px-2.5 py-1 rounded-full border border-outline-variant font-label text-xs text-primary hover:bg-surface-container-high transition-colors duration-150"
        >
          Todos los días
        </button>
      </div>

      {error && <p className="font-body text-xs text-error">{error}</p>}
    </div>
  );
}

function PersonalModal({
  modoEdicion,
  form,
  errores,
  erroresHorarios,
  erroresBloquesLibres,
  cursadaOpciones,
  cursoOpciones,
  onClose,
  onGuardar,
  onChange,
  onHorarioChange,
  onAgregarHorario,
  onEliminarHorario,
  onCursadaDeHorarioChange,
  onToggleCursoHorario,
  onBloqueLibreChange,
  onDiasBloqueLibreChange,
  onAgregarBloqueLibre,
  onEliminarBloqueLibre,
}: PersonalModalProps) {
  const [horarioAConfirmar, setHorarioAConfirmar] = useState<number | null>(null);
  const [bloqueAConfirmar, setBloqueAConfirmar] = useState<string | null>(null);
  const { mostrarToast } = useToast();

  const handleCancelar = () => {
    mostrarToast(modoEdicion ? TOAST.CANCELANDO_EDICION : TOAST.CANCELANDO_CARGA);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 cursor-not-allowed">

      <div className="bg-background border border-outline-variant w-full max-w-2xl rounded-xl shadow-md cursor-auto max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container rounded-t-xl gap-4 shrink-0">
          <h3 className="font-headline text-headline-md font-bold text-on-surface">
            {modoEdicion ? 'Editar personal' : 'Nuevo personal'}
          </h3>
          <button
            onClick={handleCancelar}
            className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150 shrink-0"
          >
            <span className="material-symbols-outlined text-[1.5rem]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6 overflow-y-auto scrollbar-custom">

          {/* Datos de la persona */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label text-label-md text-on-surface-variant">Apellido</label>
                <input
                  type="text"
                  value={form.apellido}
                  onChange={e => onChange('apellido', e.target.value)}
                  placeholder="Ej: Gómez"
                  style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
                  className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${errores.apellido ? 'border-error' : 'border-outline-variant'}`}
                />
                {errores.apellido && <p className="font-body text-xs text-error">{errores.apellido}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label text-label-md text-on-surface-variant">Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={e => onChange('nombre', e.target.value)}
                  placeholder="Ej: Carlos"
                  style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
                  className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${errores.nombre ? 'border-error' : 'border-outline-variant'}`}
                />
                {errores.nombre && <p className="font-body text-xs text-error">{errores.nombre}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label text-label-md text-on-surface-variant">Email</label>
              <input
                type="text"
                value={form.email}
                onChange={e => onChange('email', e.target.value)}
                placeholder="Ej: cgomez@ees7.edu.ar"
                style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
                className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${errores.email ? 'border-error' : 'border-outline-variant'}`}
              />
              {errores.email && <p className="font-body text-xs text-error">{errores.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label text-label-md text-on-surface-variant">DNI</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.dni}
                  onChange={e => onChange('dni', e.target.value)}
                  placeholder="Ej: 30123456"
                  style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
                  className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${errores.dni ? 'border-error' : 'border-outline-variant'}`}
                />
                {errores.dni && <p className="font-body text-xs text-error">{errores.dni}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label text-label-md text-on-surface-variant">Teléfono</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.telefono}
                  onChange={e => onChange('telefono', e.target.value)}
                  placeholder="Ej: 2213456701"
                  style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
                  className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${errores.telefono ? 'border-error' : 'border-outline-variant'}`}
                />
                {errores.telefono && <p className="font-body text-xs text-error">{errores.telefono}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label text-label-md text-on-surface-variant">CUIL</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={13}
                value={form.cuil}
                onChange={e => onChange('cuil', e.target.value)}
                placeholder="Ej: 27-12345678-9"
                style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
                className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${errores.cuil ? 'border-error' : 'border-outline-variant'}`}
              />
              {errores.cuil && <p className="font-body text-xs text-error">{errores.cuil}</p>}
            </div>
          </div>

          {/* Asignaciones horarias — cargo + situación de revista + bloques horarios que ocupa */}
          <div className="flex flex-col gap-4 border-t border-outline-variant pt-5">
            <h4 className="font-label text-label-md font-bold text-on-surface">
              Asignaciones Horarias
            </h4>

            {form.horarios.map((horario, idx) => (
              <div key={idx} className="bg-surface-container rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-label text-xs text-on-surface-variant uppercase tracking-wide">
                    Asignación {idx + 1}
                  </span>
                  <div className="flex items-center h-8">
                    {form.horarios.length > 1 && (
                      horarioAConfirmar === idx ? (
                        <div className="flex items-center gap-2">
                          <span className="font-label text-xs text-on-surface-variant">¿Eliminar?</span>
                          <button
                            type="button"
                            onClick={() => { onEliminarHorario(idx); setHorarioAConfirmar(null); }}
                            className="cursor-pointer px-2.5 py-1 rounded-lg bg-error-container text-error font-label text-xs font-medium hover:opacity-80 transition-opacity"
                          >
                            Sí
                          </button>
                          <button
                            type="button"
                            onClick={() => setHorarioAConfirmar(null)}
                            className="cursor-pointer px-2.5 py-1 rounded-lg border border-outline-variant text-on-surface-variant font-label text-xs hover:bg-surface-container-high transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setHorarioAConfirmar(idx)}
                          className="cursor-pointer p-1 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors duration-150"
                          title="Eliminar asignación"
                        >
                          <span className="material-symbols-outlined text-[1.1rem] leading-none">delete</span>
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                  <DropdownCampo
                    label="Tipo de cargo"
                    valor={horario.tipoCargo}
                    opciones={TIPO_CARGO_OPCIONES}
                    placeholder="Seleccioná un cargo"
                    error={erroresHorarios[idx]?.tipoCargo}
                    onSelect={v => onHorarioChange(idx, 'tipoCargo', v)}
                  />

                  <DropdownCampo
                    label="Situación de revista"
                    valor={horario.situacionRevista}
                    opciones={SITUACION_REVISTA_OPCIONES}
                    placeholder="Seleccioná una situación"
                    error={erroresHorarios[idx]?.situacionRevista}
                    onSelect={v => onHorarioChange(idx, 'situacionRevista', v)}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="font-label text-label-md text-on-surface-variant">Fecha de inicio</label>
                    <input
                      type="date"
                      value={horario.fechaIni}
                      onChange={e => onHorarioChange(idx, 'fechaIni', e.target.value)}
                      style={{
                        color: !horario.fechaIni ? 'color-mix(in srgb, var(--on-surface) 38%, transparent)' : 'var(--on-surface)',
                        backgroundColor: 'var(--background)',
                      }}
                      className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${erroresHorarios[idx]?.fechaIni ? 'border-error' : 'border-outline-variant'}`}
                    />
                    {erroresHorarios[idx]?.fechaIni && <p className="font-body text-xs text-error">{erroresHorarios[idx].fechaIni}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-label text-label-md text-on-surface-variant">Fecha de fin (opcional)</label>
                    <input
                      type="date"
                      value={horario.fechaFin}
                      onChange={e => onHorarioChange(idx, 'fechaFin', e.target.value)}
                      style={{
                        color: !horario.fechaFin ? 'color-mix(in srgb, var(--on-surface) 38%, transparent)' : 'var(--on-surface)',
                        backgroundColor: 'var(--background)',
                      }}
                      className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${erroresHorarios[idx]?.fechaFin ? 'border-error' : 'border-outline-variant'}`}
                    />
                    {erroresHorarios[idx]?.fechaFin && <p className="font-body text-xs text-error">{erroresHorarios[idx].fechaFin}</p>}
                  </div>
                </div>

                {/* Bloques horarios — la selección depende del tipo de cargo elegido arriba */}
                <div className="flex flex-col gap-2 border-t border-outline-variant pt-3">
                  <span className="font-label text-label-md text-on-surface-variant">Bloques horarios</span>

                  {!horario.tipoCargo ? (
                    <p className="font-body text-body-sm text-on-surface-variant">
                      Seleccioná un tipo de cargo para configurar sus bloques horarios.
                    </p>
                  ) : horario.tipoCargo === 'Profesor' ? (
                    <ComboBoxOpciones
                      label="Cursada"
                      valor={horario.cursadaId}
                      opciones={cursadaOpciones(horario)}
                      placeholder="Buscá por materia, curso o ciclo"
                      sinResultadosTexto="No se encontraron cursadas"
                      error={erroresHorarios[idx]?.cursadaId}
                      onSelect={v => onCursadaDeHorarioChange(idx, v)}
                    />
                  ) : (
                    <>
                      {erroresHorarios[idx]?.bloquesLibres && (
                        <p className="font-body text-xs text-error">{erroresHorarios[idx].bloquesLibres}</p>
                      )}

                      {horario.bloquesLibres.map((bloque, bloqueIdx) => {
                        const claveConfirmar = `${idx}-${bloqueIdx}`;
                        const erroresBloque = erroresBloquesLibres[idx]?.[bloqueIdx];
                        return (
                          <div key={bloqueIdx} className="bg-background rounded-lg border border-outline-variant p-3 flex items-start gap-2">
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-3">
                              <SelectorDias
                                valores={bloque.dias}
                                error={erroresBloque?.dias}
                                onChange={dias => onDiasBloqueLibreChange(idx, bloqueIdx, dias)}
                              />
                              <div className="flex flex-col gap-1.5">
                                <label className="font-label text-label-md text-on-surface-variant">Hora de inicio</label>
                                <input
                                  type="time"
                                  value={bloque.horaIni}
                                  onChange={e => onBloqueLibreChange(idx, bloqueIdx, 'horaIni', e.target.value)}
                                  style={{
                                    color: !bloque.horaIni ? 'color-mix(in srgb, var(--on-surface) 38%, transparent)' : 'var(--on-surface)',
                                    backgroundColor: 'var(--background)',
                                  }}
                                  className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${erroresBloque?.horaIni ? 'border-error' : 'border-outline-variant'}`}
                                />
                                {erroresBloque?.horaIni && <p className="font-body text-xs text-error">{erroresBloque.horaIni}</p>}
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="font-label text-label-md text-on-surface-variant">Hora de fin</label>
                                <input
                                  type="time"
                                  value={bloque.horaFin}
                                  onChange={e => onBloqueLibreChange(idx, bloqueIdx, 'horaFin', e.target.value)}
                                  style={{
                                    color: !bloque.horaFin ? 'color-mix(in srgb, var(--on-surface) 38%, transparent)' : 'var(--on-surface)',
                                    backgroundColor: 'var(--background)',
                                  }}
                                  className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${erroresBloque?.horaFin ? 'border-error' : 'border-outline-variant'}`}
                                />
                                {erroresBloque?.horaFin && <p className="font-body text-xs text-error">{erroresBloque.horaFin}</p>}
                              </div>
                            </div>

                            {horario.bloquesLibres.length > 1 && (
                              <div className="pt-6">
                                {bloqueAConfirmar === claveConfirmar ? (
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => { onEliminarBloqueLibre(idx, bloqueIdx); setBloqueAConfirmar(null); }}
                                      className="cursor-pointer px-2.5 py-1 rounded-lg bg-error-container text-error font-label text-xs font-medium hover:opacity-80 transition-opacity"
                                    >
                                      Sí
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setBloqueAConfirmar(null)}
                                      className="cursor-pointer px-2.5 py-1 rounded-lg border border-outline-variant text-on-surface-variant font-label text-xs hover:bg-surface-container-high transition-colors"
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setBloqueAConfirmar(claveConfirmar)}
                                    className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors duration-150"
                                    title="Eliminar bloque horario"
                                  >
                                    <span className="material-symbols-outlined text-[1.1rem] leading-none">delete</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => onAgregarBloqueLibre(idx)}
                        className="cursor-pointer self-start flex items-center gap-xs px-3 py-1.5 rounded-lg font-label text-label-md text-primary hover:bg-surface-container-high transition-colors duration-150"
                      >
                        <span className="material-symbols-outlined text-[1.1rem]">add</span>
                        Agregar bloque horario
                      </button>
                    </>
                  )}
                </div>

                {/* Cursos a cargo — solo para Preceptor, independiente de sus bloques horarios */}
                {horario.tipoCargo === 'Preceptor' && (
                  <div className="border-t border-outline-variant pt-3">
                    <ComboBoxMultiple
                      label="Cursos a cargo"
                      valores={horario.cursoIds}
                      opciones={cursoOpciones}
                      placeholder="Buscá un curso"
                      sinResultadosTexto="No se encontraron cursos"
                      error={erroresHorarios[idx]?.cursoIds}
                      onToggle={cursoId => onToggleCursoHorario(idx, cursoId)}
                    />
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={onAgregarHorario}
              className="cursor-pointer self-start flex items-center gap-xs px-3 py-1.5 rounded-lg font-label text-label-md text-primary hover:bg-surface-container-high transition-colors duration-150"
            >
              <span className="material-symbols-outlined text-[1.1rem]">add</span>
              Agregar asignación
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-outline-variant bg-surface-container rounded-b-xl shrink-0">
          <button
            onClick={onGuardar}
            className="cursor-pointer px-4 py-2.5 rounded-xl bg-primary text-background font-label text-label-md hover:opacity-90 transition-all duration-200 shadow-sm"
          >
            {modoEdicion ? 'Guardar cambios' : 'Crear personal'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default PersonalModal;
