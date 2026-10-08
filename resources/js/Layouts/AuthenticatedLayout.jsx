import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { LayoutDashboard, Users, Building2, Terminal, LogOut, Shield, Sun, Moon, Cog, FileText } from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, activeCompany, companies } = usePage().props;
    const user = auth.user;

    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('theme') !== 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            document.body.classList.add('bg-[#030811]', 'text-slate-100');
            document.body.classList.remove('bg-slate-50', 'text-slate-800');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            document.body.classList.add('bg-slate-50', 'text-slate-800');
            document.body.classList.remove('bg-[#030811]', 'text-slate-100');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(prev => !prev);

    const userRole = String(user?.role || '').toLowerCase();
    const userRoles = Array.isArray(user?.roles) ? user.roles.map(r => String(r?.name || r).toLowerCase()) : [];
    const isAdminUser = user?.is_superadmin || 
                        userRole.includes('admin') || 
                        userRoles.some(r => r.includes('admin'));

    const isSuperAdmin = user?.is_superadmin || 
                         userRole.includes('superadmin') || 
                         userRoles.some(r => r.includes('superadmin'));

    const canManageUsers = isAdminUser;

    const themeClasses = {
        bgMain: isDark ? 'bg-[#030811] text-slate-100' : 'bg-[#F8FAFC] text-slate-900',
        sidebar: 'bg-gradient-to-b from-[#1D4ED8] via-[#1E40AF] to-[#1E3A8A] border-blue-900/50',
        header: isDark ? 'bg-[#07101e]/80 border-[#173e5f]/50' : 'bg-white/90 border-slate-200 shadow-sm',
        card: isDark ? 'bg-[#07101e]/90 border-[#173e5f] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm',
        textMuted: isDark ? 'text-[#7d90a6]' : 'text-gray-500',
        tableHeader: isDark ? 'bg-[#0a1727] text-[#5dbdf2] border-[#173e5f]' : 'bg-gray-50 text-gray-700 border-slate-100',
        tableRowHover: isDark ? 'hover:bg-[#0a1727]/50' : 'hover:bg-blue-50/50',
        sidebarText: isDark ? 'text-[#7d90a6] hover:bg-[#0a1727]/50 hover:text-white' : 'text-white/80 hover:bg-white/10 hover:text-white',
        sidebarActive: isDark ? 'bg-[#0a1727] border border-[#21a5e7]/40 text-[#2bd2f2] shadow-[0_0_15px_rgba(33,165,231,0.15)]' : 'bg-white/10 border border-white/20 text-white rounded-lg',
        sidebarBrand: isDark ? 'text-[#32cdfa] to-[#7b97b8]' : 'text-blue-100',
        tourButton: 'bg-blue-400/30 hover:bg-blue-400/50 text-white border border-white/20 rounded-lg',
    };

    return (
        <div className={`min-h-screen flex font-sans select-none relative overflow-hidden ${themeClasses.bgMain}`}>
            {/* Illumination Glow Background */}
            {isDark && (
                <>
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#0088cc]/10 rounded-full blur-[160px] pointer-events-none" />
                    <div className="absolute bottom-0 right-10 w-[600px] h-[600px] bg-[#00e1ff]/10 rounded-full blur-[180px] pointer-events-none" />
                </>
            )}

            {/* Sidebar */}
            <aside className={`w-64 backdrop-blur-xl border-r flex flex-col justify-between p-6 z-20 ${themeClasses.sidebar}`}>
                <div className="space-y-8">
                    {/* Brand Header */}
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-[#2bd2f2] to-[#0eb4d8] p-2 rounded-xl shadow-[0_0_15px_rgba(43,210,242,0.4)]">
                            <Terminal className="w-5 h-5 text-[#030d1a]"/>
                        </div>
                        <div>
                            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#32cdfa] to-[#7b97b8]">
                                CCG
                            </span>
                            <span className={`block text-[8px] font-bold tracking-[0.2em] uppercase ${themeClasses.textMuted}`}>
                                PLATAFORMA
                            </span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-2">
                         <Link
                             href={route('dashboard')}
                             className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                 route().current('dashboard')
                                     ? themeClasses.sidebarActive
                                     : themeClasses.sidebarText
                             }`}
                         >
                             <LayoutDashboard className="w-4 h-4"/>
                             <span>Dashboard</span>
                         </Link>

                         {canManageUsers && (
                             <Link
                                 href={route('users.index')}
                                 className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                     route().current('users.*')
                                         ? themeClasses.sidebarActive
                                         : themeClasses.sidebarText
                                 }`}
                             >
                                 <Users className="w-4 h-4"/>
                                 <span>Usuarios</span>
                             </Link>
                         )}

                          {isSuperAdmin && (
                              <Link
                                  href={route('companies.index')}
                                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                      route().current('companies.*')
                                          ? themeClasses.sidebarActive
                                          : themeClasses.sidebarText
                                  }`}
                              >
                                  <Building2 className="w-4 h-4"/>
                                  <span>Empresas</span>
                              </Link>
                          )}

                          <Link
                              href={route('quotations.index')}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                  route().current('quotations.*')
                                      ? themeClasses.sidebarActive
                                      : themeClasses.sidebarText
                              }`}
                          >
                              <FileText className="w-4 h-4"/>
                              <span>Cotizaciones</span>
                          </Link>
                     </nav>
                </div>

                <div className="pt-6 border-t border-white/10">
                    <Link
                        href={route('profile.edit')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${themeClasses.sidebarText}`}
                    >
                        <Cog className="w-4 h-4"/>
                        <span>Configuración</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 z-10">
                {/* Navbar */}
                <header className={`h-20 backdrop-blur-xl border-b px-8 flex items-center justify-between ${themeClasses.header}`}>
                    <div>
                         {header && <div className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{header}</div>}
                    </div>

                    <div className="flex items-center gap-4">
                        <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{user.email}</span>

                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-xl border transition-all ${
                                isDark
                                    ? 'bg-[#0a1727] border-[#21a5e7]/30 text-[#2bd2f2] hover:bg-[#102238]'
                                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                            }`}
                            title="Cambiar Tema"
                        >
                            {isDark ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4 text-slate-700"/>}
                        </button>

                         <span className={`border text-xs font-black px-3.5 py-1.5 rounded-xl uppercase tracking-wider ${
                             isDark
                                 ? 'bg-[#0a1727] border-[#21a5e7]/40 text-[#2bd2f2] shadow-[0_0_12px_rgba(43,210,242,0.2)]'
                                 : 'bg-blue-50 border-blue-300 text-blue-800'
                         }`}>
                             {auth.user.roles?.[0]?.name || auth.user.role || 'Cliente'}
                         </span>

                         {/* Selector / Badge de Organización activa */}
                         <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl text-xs font-semibold ${
                             isDark
                                 ? 'bg-slate-800/80 border-slate-700 text-cyan-400'
                                 : 'bg-white border-blue-300 text-blue-800 shadow-sm'
                         }`}>
                             <span>🏢 Organización:</span>
                             {isSuperAdmin && companies && companies.length > 0 ? (
                                 <select
                                     value={activeCompany?.id || ''}
                                     onChange={(e) => {
                                         router.post(route('companies.switch'), { company_id: e.target.value || null });
                                     }}
                                     className={`font-bold text-xs rounded-lg px-2 py-1 border focus:outline-none cursor-pointer ${
                                         isDark
                                             ? 'bg-[#030811] text-white border-cyan-500/30 focus:border-cyan-400'
                                             : 'bg-white text-slate-900 border-blue-300 focus:border-blue-500'
                                     }`}
                                 >
                                     <option value="">Todas / Sin Organización</option>
                                     {companies.map((comp) => (
                                         <option key={comp.id} value={comp.id}>
                                             {comp.name} ({comp.project})
                                         </option>
                                     ))}
                                 </select>
                             ) : (
                                 <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                     {activeCompany?.name || auth.user.operacion || 'Sin Organización'}
                                 </span>
                             )}
                         </div>

                        <Link
                            as="button"
                            method="post"
                            href={route('logout')}
                            className={`border text-xs font-bold py-2 px-4 rounded-xl transition-all flex items-center gap-2 ${
                                isDark
                                    ? 'bg-[#1e1015] hover:bg-[#2d121a] border-[#f43f5e]/40 text-[#f43f5e] shadow-[0_0_10px_rgba(244,63,94,0.15)]'
                                    : 'bg-white hover:bg-rose-50 border-rose-200 text-rose-600'
                            }`}
                        >
                            <LogOut className="w-3.5 h-3.5"/>
                            <span>Cerrar Sesión</span>
                        </Link>
                    </div>
                </header>

                {/* Body Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
