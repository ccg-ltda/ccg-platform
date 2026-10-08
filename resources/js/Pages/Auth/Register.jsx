import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { User, Lock, Mail, ArrowRight } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        username: '',
        email: '',
        phone: '',
        operacion: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <>
            <Head title="Crear Cuenta - CCG"/>

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
                                    CCG · NUEVA CUENTA
                                </span>
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                                    Crear <span className="text-cyan-400">cuenta.</span>
                                </h1>
                                <p className="text-slate-400 text-sm">
                                    Regístrate para acceder a la plataforma
                                </p>
                            </div>

                            <form onSubmit={submit} className="space-y-5">
                                {/* Input Nombre */}
                                <div>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-4 text-purple-400">
                                            <User className="w-5 h-5"/>
                                        </div>
                                        <input
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={data.name}
                                            placeholder="Nombre completo"
                                            className="w-full bg-[#080d1a] border border-cyan-500/20 text-white placeholder-slate-500 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                                            autoComplete="name"
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="mt-1.5 text-xs text-rose-400 pl-1">{errors.name}</p>
                                    )}
                                </div>

                                {/* Input Username */}
                                <div>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-4 text-cyan-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="username"
                                            type="text"
                                            name="username"
                                            value={data.username}
                                            placeholder="Nombre de usuario"
                                            className="w-full bg-[#080d1a] border border-cyan-500/20 text-white placeholder-slate-500 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                                            autoComplete="username"
                                            onChange={(e) => setData('username', e.target.value)}
                                            required
                                        />
                                    </div>
                                    {errors.username && (
                                        <p className="mt-1.5 text-xs text-rose-400 pl-1">{errors.username}</p>
                                    )}
                                </div>

                                {/* Input Email */}
                                <div>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-4 text-emerald-400">
                                            <Mail className="w-5 h-5"/>
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            placeholder="Correo electrónico"
                                            className="w-full bg-[#080d1a] border border-cyan-500/20 text-white placeholder-slate-500 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                                            autoComplete="email"
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1.5 text-xs text-rose-400 pl-1">{errors.email}</p>
                                    )}
                                </div>

                                {/* Input Teléfono */}
                                <div>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-4 text-emerald-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            value={data.phone}
                                            placeholder="Teléfono"
                                            className="w-full bg-[#080d1a] border border-cyan-500/20 text-white placeholder-slate-500 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                                            autoComplete="tel"
                                            onChange={(e) => setData('phone', e.target.value)}
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="mt-1.5 text-xs text-rose-400 pl-1">{errors.phone}</p>
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
                                            placeholder="Nombre de la organización"
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
                                            autoComplete="new-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                            required
                                        />
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1.5 text-xs text-rose-400 pl-1">{errors.password}</p>
                                    )}
                                </div>

                                {/* Input Confirmar Contraseña */}
                                <div>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-4 text-amber-500">
                                            <Lock className="w-5 h-5"/>
                                        </div>
                                        <input
                                            id="password_confirmation"
                                            type="password"
                                            name="password_confirmation"
                                            value={data.password_confirmation}
                                            placeholder="Confirmar contraseña"
                                            className="w-full bg-[#080d1a] border border-cyan-500/20 text-white placeholder-slate-500 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                                            autoComplete="new-password"
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            required
                                        />
                                    </div>
                                    {errors.password_confirmation && (
                                        <p className="mt-1.5 text-xs text-rose-400 pl-1">{errors.password_confirmation}</p>
                                    )}
                                </div>

                                {/* Botón Registrarse */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold py-3.5 px-6 rounded-2xl shadow-[0_0_25px_rgba(34,211,238,0.4)] hover:shadow-[0_0_35px_rgba(34,211,238,0.6)] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
                                >
                                    <span>Crear cuenta</span>
                                    <ArrowRight className="w-4 h-4 stroke-[3]"/>
                                </button>

                                {/* Link a Login */}
                                <div className="text-center pt-2">
                                    <Link className="text-xs text-slate-400 hover:text-cyan-400 transition-colors" href={route('login')}>
                                        ¿Ya tienes cuenta? Inicia sesión
                                    </Link>
                                </div>
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
                                Únete a la <span className="text-cyan-400">revolución</span> digital.
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
