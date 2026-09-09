import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../types/schemas/loginSchema';
import { useNavigate } from 'react-router-dom';
import LogoEscuela from '../components/elements/LogoEscuela';
import CheIcon from '../components/elements/CheIcon';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import { useCicloLectivo } from '../hooks/useCicloLectivo';
import { cicloLectivoActual, nombreCicloLectivo, type CicloLectivo } from '../types/CicloLectivo';
import type { Personal } from '../types/Personal';
import type { Usuario } from '../types/Usuario';

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { reiniciarCicloLectivoActivo } = useCicloLectivo();
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [errorServidor, setErrorServidor] = useState<string | null>(null);

    const { data: ciclosData } = useFetch<CicloLectivo[]>('/data/ciclosLectivos.json');
    const { data: personalData, loading: loadingPersonal } = useFetch<Personal[]>('/data/personal.json');
    const { data: usuariosData, loading: loadingUsuarios } = useFetch<Usuario[]>('/data/usuarios.json');

    const cicloActual = cicloLectivoActual(ciclosData ?? []);
    const nombreCicloActual = cicloActual ? nombreCicloLectivo(cicloActual) : '';

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '', recordarme: false } satisfies LoginFormData,
    });

    const onSubmit = async (data: LoginFormData) => {
        setErrorServidor(null);

        const personal = (personalData ?? []).find(
            p => p.email.toLowerCase() === data.email.toLowerCase()
        );
        if (!personal) {
            setErrorServidor('Las credenciales ingresadas no corresponden a ningún usuario.');
            return;
        }

        const usuario = (usuariosData ?? []).find(
            u => u.personalId === personal.id && u.contrasenia === data.password
        );
        if (!usuario) {
            setErrorServidor('Las credenciales ingresadas no corresponden a ningún usuario.');
            return;
        }

        if (!usuario.activo) {
            setErrorServidor('Tu usuario está inactivo. Contactá al administrador.');
            return;
        }

        reiniciarCicloLectivoActivo();
        login(usuario, personal);
        navigate('/', { replace: true });
    };

    const cargandoDatos = loadingPersonal || loadingUsuarios;

    return (
        <div className="min-h-screen bg-surface-container flex items-center justify-center p-4 sm:p-6" >
            <div className="w-full max-w-4xl bg-background rounded-2xl border border-outline-variant shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-2">

                {/* Panel institucional */}
                <div className="hidden lg:flex flex-col bg-login-hero text-on-login-hero p-10">
                    <div className="flex items-center gap-3 mb-8">
                        <LogoEscuela className="h-10 w-10 text-on-login-hero shrink-0" />
                        <div className="flex flex-col justify-center min-w-0">
                            <span className="font-headline leading-none text-sm truncate">
                                Esc. de Educ. Secundaria N°7
                            </span>
                            <span className="font-headline font-extrabold leading-none text-xl flex items-center gap-0.5 truncate">
                                Ernesto
                                <CheIcon className="h-[1.25em] w-auto shrink-0 -translate-y-[0.1em]" />
                                Guevara
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h1 className="font-headline text-headline-sm font-bold leading-tight">
                            Sistema de Gestión Institucional <br/>EES N°7 "Che Guevara"
                        </h1>
                        <p className="font-body text-body-sm text-on-login-hero/80">
                            Ciclo Lectivo {nombreCicloActual}. <br/>Accedé con tu cuenta institucional.
                        </p>
                    </div>

                    <p className="font-body text-body-sm text-on-login-hero/60">
                        {/*para hacer bulto*/}
                    </p>
                </div>

                {/* Formulario */}
                <div className="p-6 sm:p-10 flex flex-col gap-8 justify-center">

                    {/* Encabezado mobile */}
                    <div className="flex flex-col items-center gap-1 lg:hidden text-center">
                        <div className="flex items-center gap-2 mb-2">
                            <LogoEscuela className="h-8 w-8 text-primary shrink-0" />
                            <div className="flex flex-col justify-center text-primary min-w-0">
                                <span className="font-headline leading-none text-[0.7rem] truncate">
                                    Esc. de Educ. Secundaria N°7
                                </span>
                                <span className="font-headline font-extrabold leading-none text-base flex items-center gap-0.5 truncate">
                                    Ernesto
                                    <CheIcon className="h-[1.25em] w-auto shrink-0 -translate-y-[0.1em]" />
                                    Guevara
                                </span>
                            </div>
                        </div>
                        <h1 className="font-headline text-headline-md font-bold text-on-surface">
                            Iniciar Sesión
                        </h1>
                        <p className="font-body text-body-sm text-on-surface-variant">
                            EES N°7 · Ciclo Lectivo {nombreCicloActual}
                        </p>
                    </div>

                    {/* Encabezado desktop */}
                    <div className="hidden lg:block">
                        <h1 className="font-headline text-headline-md font-bold text-on-surface">
                            Iniciar Sesión
                        </h1>
                        <p className="font-body text-body-sm text-on-surface-variant mt-1">
                            Ingresá tus credenciales para acceder al sistema.
                        </p>
                    </div>

                    {errorServidor && (
                        <div className="bg-error-container border border-outline-variant rounded-xl p-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-error text-[1.25rem]">error</span>
                            <p className="font-body text-body-sm text-on-error-container">{errorServidor}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 mb-6" noValidate>

                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="email" className="font-label text-label-md text-on-surface">
                                Correo institucional
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[1.25rem] pointer-events-none">
                                    mail
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="usuario@ees7.edu.ar"
                                    autoComplete="email"
                                    {...register('email')}
                                    aria-invalid={!!errors.email}
                                    className={`w-full pl-10 pr-3 py-2.5 bg-surface-container-high border rounded-lg text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                                        errors.email ? 'border-error' : 'border-outline-variant'
                                    }`}
                                />
                            </div>
                            {errors.email && (
                                <p className="font-body text-xs text-error mt-0.5">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="font-label text-label-md text-on-surface">
                                    Contraseña
                                </label>
                                <button
                                    type="button"
                                    className="text-primary font-label text-xs hover:underline cursor-pointer"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[1.25rem] pointer-events-none">
                                    lock
                                </span>
                                <input
                                    id="password"
                                    type={mostrarPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    {...register('password')}
                                    aria-invalid={!!errors.password}
                                    className={`w-full pl-10 pr-10 py-2.5 bg-surface-container-high border rounded-lg text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                                        errors.password ? 'border-error' : 'border-outline-variant'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setMostrarPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                                    aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    <span className="material-symbols-outlined text-[1.25rem]">
                                        {mostrarPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                            {errors.password && (
                                <p className="font-body text-xs text-error mt-0.5">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Recordarme */}
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                {...register('recordarme')}
                                className="w-4 h-4 accent-primary cursor-pointer rounded border-outline-variant"
                            />
                            <span className="font-body text-body-sm text-on-surface-variant">
                                Recordarme en este dispositivo
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={isSubmitting || cargandoDatos}
                            className="w-full bg-primary text-background font-label text-sm py-3 rounded-lg cursor-pointer text-center font-semibold shadow-xs hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-[1.25rem]">
                                        progress_activity
                                    </span>
                                    Ingresando...
                                </>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
