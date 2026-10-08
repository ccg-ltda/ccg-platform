import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { User, Lock, ArrowRight } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        operacion: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <>
            <Head title="Iniciar Sesión - CCG"/>

            <div className="min-h-screen w-full bg-[#050b14] text-slate-100 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-hidden font-sans">
                {/* Iluminaciones Neón de Fondo */}
                <div className="absolute top-1/4 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
                <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[160px] pointer-events-none" />

                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center z-10">

                    {/* Tarjeta de Formulario (Izquierda) */}
                    <div className="lg:col-span-5 w-full">
                        <div className="bg-[#0b1322]/85 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl p-8 sm:p-10 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative">

                            {/* Línea Neón Superior */}
                            <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

                            <div className="mb-8">
                                <span className="text-[11px] font-bold tracking-[0.2em] text-cyan-400 uppercase block mb-1">
                                    CCG · ACCESO SEGURO
                                </span>
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                                    Iniciar <span className="text-cyan-400">sesión.</span>
                                </h1>
                                <p className="text-slate-400 text-sm">
                                    Accede a tu cuenta para continuar
                                </p>
                            </div>

                            {status && (
                                <div className="mb-4 text-sm font-medium text-emerald-400 bg-emerald-950/50 p-3 rounded-xl border border-emerald-500/30">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-5">
                                {/* Input Usuario */}
                                <div>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-4 text-purple-400">
                                            <User className="w-5 h-5"/>
                                        </div>
                                        <input
                                            id="login"
                                            type="text"
                                            name="login"
                                            value={data.login}
                                            placeholder="Correo, Usuario o Teléfono"
                                            className="w-full bg-[#080d1a] border border-cyan-500/20 text-white placeholder-slate-500 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                                            autoComplete="username"
                                            onChange={(e) => setData('login', e.target.value)}
                                            required
                                        />
                                    </div>
                                    {errors.login && (
                                        <p className="mt-1.5 text-xs text-rose-400 pl-1">{errors.login}</p>
                                    )}
                                </div>

                                {/* Input Organización */}
                                <div>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-4 text-cyan-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <input
                                            id="operacion"
                                            type="text"
                                            name="operacion"
                                            value={data.operacion}
                                            placeholder="Organización"
                                            className="w-full bg-[#080d1a] border border-cyan-500/20 text-white placeholder-slate-500 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                                            autoComplete="organization"
                                            onChange={(e) => setData('operacion', e.target.value)}
                                            required
                                        />
                                    </div>
                                    {errors.operacion && (
                                        <p className="mt-1.5 text-xs text-rose-400 pl-1">{errors.operacion}</p>
                                    )}
                                </div>

                                {/* Input Contraseña */}
                                <div>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-4 text-amber-500">
                                            <Lock className="w-5 h-5"/>
                                        </div>
                                        <input
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={data.password}
                                            placeholder="Contraseña"
                                            className="w-full bg-[#080d1a] border border-cyan-500/20 text-white placeholder-slate-500 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                                            autoComplete="current-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                            required
                                        />
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1.5 text-xs text-rose-400 pl-1">{errors.password}</p>
                                    )}
                                </div>

                                {/* Botón Iniciar Sesión */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold py-3.5 px-6 rounded-2xl shadow-[0_0_25px_rgba(34,211,238,0.4)] hover:shadow-[0_0_35px_rgba(34,211,238,0.6)] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
                                >
                                    <span>Iniciar sesión</span>
                                    <ArrowRight className="w-4 h-4 stroke-[3]"/>
                                </button>

                                {/* Recuperación de Contraseña */}
                                {canResetPassword && (
                                    <div className="text-center pt-2">
                                        <Link className="text-xs text-slate-400 hover:text-cyan-400 transition-colors" href="{route('password.request')}">
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Branding y Logo CCG (Derecha) */}
                    <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left px-4 lg:pl-10 relative">

                        {/* Logo Gran Formato */}
                        <div className="mb-2">
                            <h2 className="text-8xl sm:text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-slate-400 drop-shadow-[0_0_35px_rgba(34,211,238,0.3)]">
                                CCG
                            </h2>
                            <p className="text-xs font-bold tracking-[0.35em] text-slate-400 uppercase mt-1">
                                TABLERO DE MARCA · CCG
                            </p>
                        </div>

                        {/* Texto de Impacto */}
                        <div className="mt-6 max-w-md">
                            <h3 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                                Inteligencia que <span className="text-cyan-400">escala</span> operaciones.
                            </h3>
                        </div>

                        {/* Arte Abstracto / Glow Derecho */}
                        <div className="absolute -right-16 bottom-0 w-80 h-80 bg-cyan-500/20 rounded-full blur-[110px] pointer-events-none" />
                    </div>

                </div>
            </div>
        </>
    );
}
