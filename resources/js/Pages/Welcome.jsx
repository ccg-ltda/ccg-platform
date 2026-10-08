import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Code, Cpu, ShieldCheck, Sparkles, Terminal } from 'lucide-react';

export default function Welcome({ auth, canRegister }) {
    return (
        <>
            <Head title="CCG - Innovación en Desarrollo"/>

            <div className="min-h-screen w-full bg-[#030811] text-slate-100 flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden font-sans select-none">
                {/* Illumination Glow Background */}
                <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-[#0088cc]/10 rounded-full blur-[160px] pointer-events-none" />
                <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-[#00e1ff]/10 rounded-full blur-[180px] pointer-events-none" />

                {/* Navbar */}
                <header className="w-full max-w-7xl mx-auto flex items-center justify-between py-4 z-10 border-b border-[#173e5f]/50 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-[#2bd2f2] to-[#0eb4d8] p-2 rounded-xl shadow-[0_0_15px_rgba(43,210,242,0.4)]">
                            <Terminal className="w-6 h-6 text-[#030d1a]"/>
                        </div>
                        <div>
                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#32cdfa] to-[#7b97b8]">
                                CCG
                            </span>
                            <span className="block text-[9px] font-bold tracking-[0.25em] text-[#637d9c] uppercase">
                                PLATAFORMA DE DESARROLLO
                            </span>
                        </div>
                    </div>

                    <nav className="flex items-center gap-3">
                        {auth.user ? (
                            <Link className="bg-[#0a1727] hover:bg-[#102238] border border-[#21a5e7]/40 text-[#2bd2f2] text-sm font-bold py-2.5 px-5 rounded-xl transition-all shadow-[0_0_15px_rgba(33,165,231,0.2)]" href={route('dashboard')}>
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link className="bg-gradient-to-r from-[#2bd2f2] to-[#0eb4d8] hover:brightness-110 text-[#030d1a] font-black text-sm py-2.5 px-5 rounded-xl shadow-[0_0_20px_rgba(43,210,242,0.35)] transition-all flex items-center gap-2" href={route('login')}>
                                    <span>Iniciar Sesión</span>
                                    <ArrowRight className="w-4 h-4 stroke-[3]"/>
                                </Link>

                                <Link className="bg-[#0a1727] hover:bg-[#102238] border border-[#173e5f] hover:border-[#21a5e7]/50 text-white text-sm font-bold py-2.5 px-5 rounded-xl transition-all" href={route('register')}>
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                {/* Hero Section */}
                <main className="w-full max-w-7xl mx-auto my-auto py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
                    <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#07101e] border border-[#173e5f] text-[#5dbdf2] text-xs font-semibold shadow-inner">
                            <Sparkles className="w-4 h-4 text-[#2bd2f2]"/>
                            <span>Innovación constante & desarrollo de alto impacto</span>
                        </div>

                        <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tight">
                            Transformando ideas en <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#32cdfa] via-[#2bd2f2] to-[#7b97b8] drop-shadow-[0_0_35px_rgba(50,205,250,0.3)]">
                                Software de Vanguardia.
                            </span>
                        </h1>

                        <p className="text-[#7d90a6] text-base sm:text-lg max-w-2xl leading-relaxed">
                            Impulsamos el ecosistema digital de CCG mediante arquitecturas sólidas, experiencias interactivas y herramientas diseñadas para escalar operaciones con máxima eficiencia.
                        </p>

                        <div className="pt-4 flex flex-wrap gap-4 justify-center lg:justify-start">
                            <Link className="bg-gradient-to-r from-[#2bd2f2] to-[#0eb4d8] hover:brightness-110 text-[#030d1a] font-black text-base py-3.5 px-8 rounded-2xl shadow-[0_0_30px_rgba(43,210,242,0.4)] transition-all flex items-center gap-3" href={route('login')}>
                                <span>Acceder al Sistema</span>
                                <ArrowRight className="w-5 h-5 stroke-[3]"/>
                            </Link>
                        </div>
                    </div>

                    {/* Features Glassmorphism Grid */}
                    <div className="lg:col-span-5 grid grid-cols-1 gap-4">
                        <div className="bg-[#07101e]/90 backdrop-blur-2xl border border-[#173e5f] p-6 rounded-2xl shadow-[0_0_40px_rgba(0,180,240,0.1)] relative">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[#0a1727] border border-[#21a5e7]/30 rounded-xl text-[#2bd2f2]">
                                    <Code className="w-6 h-6"/>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">Ingeniería Moderna</h3>
                                    <p className="text-[#7d90a6] text-sm mt-1">
                                        Desarrollos modulares respaldados por las últimas tecnologías web.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#07101e]/90 backdrop-blur-2xl border border-[#173e5f] p-6 rounded-2xl shadow-[0_0_40px_rgba(0,180,240,0.1)] relative">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[#0a1727] border border-[#21a5e7]/30 rounded-xl text-[#8b5cf6]">
                                    <Cpu className="w-6 h-6"/>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">Optimización & Escala</h3>
                                    <p className="text-[#7d90a6] text-sm mt-1">
                                        Automatización inteligente y procesamiento eficiente de procesos.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#07101e]/90 backdrop-blur-2xl border border-[#173e5f] p-6 rounded-2xl shadow-[0_0_40px_rgba(0,180,240,0.1)] relative">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[#0a1727] border border-[#21a5e7]/30 rounded-xl text-[#f59e0b]">
                                    <ShieldCheck className="w-6 h-6"/>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">Seguridad Robusta</h3>
                                    <p className="text-[#7d90a6] text-sm mt-1">
                                        Control de acceso por roles y protección de datos a nivel corporativo.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="w-full max-w-7xl mx-auto pt-6 border-t border-[#173e5f]/50 flex flex-col sm:flex-row items-center justify-between text-xs text-[#637d9c] z-10 gap-2">
                    <p>© {new Date().getFullYear()} CCG · Todos los derechos reservados.</p>
                    <p className="flex items-center gap-2">
                        <span>Tecnología respaldada por CCG Core</span>
                    </p>
                </footer>
            </div>
        </>
    );
}
