import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { LayoutDashboard, Terminal, LogOut, Shield, Sun, Moon, Cog, FileText, Briefcase, Crown, Bell, BarChart3, Menu, X, Users } from 'lucide-react';
import AssistantChat from '@/Components/AssistantChat';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, activeCompany, companies, notifications: userNotifications = [] } = usePage().props;
    const user = auth.user;
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const unreadCount = userNotifications.filter(n => !n.read_at).length;

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

    const mainNavigation = [
        { name: 'Dashboard', route: 'dashboard', indexRoute: 'dashboard', icon: LayoutDashboard },
        { name: 'Negocios & Agenda', route: 'deals.*', indexRoute: 'deals.index', icon: Briefcase },
        { name: 'Suscripción', route: 'subscription.*', indexRoute: 'subscription.index', icon: Crown },
        { name: 'Reportes', route: 'reports.*', indexRoute: 'reports.index', icon: BarChart3 },
    ];

    return (
        <div className={`min-h-screen flex font-sans select-none relative overflow-hidden ${themeClasses.bgMain}`}>
            {/* Virtual Assistant Chat */}
            <AssistantChat />
            {/* Illumination Glow Background */}
            {isDark && (
                <>
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#0088cc]/10 rounded-full blur-[160px] pointer-events-none" />
                    <div className="absolute bottom-0 right-10 w-[600px] h-[600px] bg-[#00e1ff]/10 rounded-full blur-[180px] pointer-events-none" />
                </>
            )}

            {/* Sidebar */}
            <aside 
                style={{ width: '64px', minWidth: '64px', maxWidth: '64px' }} 
                className={`fixed top-0 left-0 h-screen border-r flex flex-col justify-between py-4 px-2 z-40 backdrop-blur-xl ${themeClasses.sidebar}`}
            >
                <div className="flex flex-col items-center gap-3 flex-1 mt-4">
                    {/* Botón superior de menú */}
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xs text-white tracking-wider" title="CCG Platform">
                        CCG
                    </div>

                    {/* Navegación principal */}
                    <nav className="flex flex-col items-center gap-2 w-full mt-2">
                        {mainNavigation.map((item) => {
                            const Icon = item.icon;
                            const active = route().current(item.route);
                            return (
                                <Link
                                    key={item.name}
                                    href={route(item.indexRoute || item.route)}
                                    title={item.name}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                                        active
                                            ? 'bg-white/20 text-white shadow-sm font-semibold'
                                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <Icon className="w-5 h-5 shrink-0" />
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Opción de Configuración al final (settings.index) */}
                <div className="mt-auto pt-4 w-full flex justify-center">
                    <Link
                        href={route('settings.index')}
                        title="Configuración"
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                            route().current('settings.*') || route().current('profile.edit')
                                ? 'bg-white/20 text-white'
                                : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        <Cog className="w-5 h-5 shrink-0" />
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div style={{ marginLeft: '64px' }} className="flex-1 flex flex-col min-h-screen min-w-0">
                {/* Navbar */}
                <header className={`sticky top-0 z-20 backdrop-blur-xl border-b px-8 py-4 flex items-center justify-between w-full gap-2 overflow-visible ${themeClasses.header}`}>
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${
                            isDark
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}>
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Online
                        </div>
                        <div className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-sm transition-all flex-1 max-w-[200px] ${
                            isDark
                                ? 'bg-[#0a1727]/80 border-[#21a5e7]/20 focus-within:border-[#21a5e7]/50'
                                : 'bg-white/80 border-slate-200 focus-within:border-blue-400'
                        }`}>
                            <svg className={`w-4 h-4 shrink-0 ${isDark ? 'text-[#2bd2f2]' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className={`bg-transparent border-none outline-none text-sm w-full ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-700 placeholder-slate-400'}`}
                            />
                        </div>
                        {header && <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{header}</div>}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative inline-block">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`w-10 h-10 p-2 flex items-center justify-center rounded-xl border transition ${
                                    isDark
                                        ? 'border-[#21a5e7]/30 hover:bg-[#102238] text-[#2bd2f2]'
                                        : 'border-gray-200 hover:bg-gray-100 text-slate-700'
                                }`}
                            >
                                <span className="text-xl">🔔</span>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            {showNotifications && (
                                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 z-50">
                                    <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">Notificaciones</div>
                                    <div className="max-h-64 overflow-y-auto space-y-2">
                                        {userNotifications.length > 0 ? (
                                            userNotifications.slice(0, 10).map((n) => (
                                                <div key={n.id} className={`px-3 py-2.5 rounded-lg border ${isDark ? 'border-[#173e5f] bg-[#0a1727]/50' : 'border-slate-50 bg-slate-50'}`}>
                                                    <p className="text-xs font-bold text-slate-900">{n.data?.title || 'Notificación'}</p>
                                                    <p className="text-[11px] text-slate-500 mt-0.5">{n.data?.message}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-6 text-center text-xs text-slate-400 italic">Sin notificaciones</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="relative inline-block">
                            <button
                                onClick={() => setShowProfile(!showProfile)}
                                className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl border transition ${
                                    isDark
                                        ? 'border-[#21a5e7]/30 hover:bg-[#102238]'
                                        : 'border-gray-200 hover:bg-gray-100'
                                }`}
                                title="Mi perfil"
                            >
                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                                    isDark ? 'bg-[#0a1727] text-[#2bd2f2]' : 'bg-blue-100 text-blue-700'
                                }`}>
                                    {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                                <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{user.name || user.email}</span>
                            </button>
                            {showProfile && (
                                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-2 z-50">
                                    <Link
                                        href={route('profile.show')}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-gray-100 transition"
                                    >
                                        <Cog className="w-4 h-4" />
                                        Perfil
                                    </Link>
                                </div>
                            )}
                        </div>

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
                            className={`shrink-0 whitespace-nowrap border text-xs font-bold py-2 px-4 rounded-xl transition-all flex items-center gap-2 ${
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

                {/* Main Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
