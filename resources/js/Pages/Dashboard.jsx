import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Users, Shield, Key, Clock, Check, X, TrendingUp, Calendar, Building2 } from 'lucide-react';

export default function Dashboard(props) {
    const { stats = {}, funnelStats = [], reservationsStats = {}, dealsByCompany = [], usersByPlan = {}, conversionRate = 0, totalDeals = 0, wonDeals = 0 } = props;
    const { auth } = usePage().props;
    const isSuperAdmin = auth.user?.roles?.[0]?.name === 'superadmin' || auth.user?.role === 'superadmin';
    const pendingUsers = stats?.pendingUsers ?? [];
    const allRequests = stats?.allRequests ?? [];

    const cards = [
        { title: 'Total Usuarios', value: stats?.users ?? 0, icon: Users, color: '#2bd2f2' },
        { title: 'Roles Activos', value: stats?.roles ?? 0, icon: Shield, color: '#8b5cf6' },
        { title: 'Permisos', value: stats?.permissions ?? 0, icon: Key, color: '#10b981' },
    ];

    const stageColors = {
        'Cita Programada': '#3b82f6',
        'Calificado para Comprar': '#8b5cf6',
        'Presentación Programada': '#f59e0b',
        'Propuesta / Cotización': '#06b6d4',
        'Contrato Enviado': '#6366f1',
        'Cierre Ganado': '#10b981',
        'Cierre Perdido': '#ef4444',
    };

    const maxFunnelCount = Math.max(...funnelStats.map(s => s.count), 1);
    const maxCompanyCount = Math.max(...dealsByCompany.map(c => c.count), 1);

    const handleApprove = (userId) => {
        router.post(route('users.approve', userId));
    };

    const handleReject = (userId) => {
        if (window.confirm('¿Estás seguro de rechazar esta solicitud?')) {
            router.post(route('users.reject', userId));
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pendiente':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">Pendiente</span>;
            case 'aprobado':
            case 'activo':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">Aprobado</span>;
            case 'rechazado':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 border border-rose-500/30 text-rose-400">Rechazado</span>;
            default:
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-500/15 border border-slate-500/30 text-slate-400">{status}</span>;
        }
    };

    return (
        <AuthenticatedLayout auth={props?.auth} errors={props?.errors} user={auth?.user}>
            <Head title="Dashboard" />

            <div className="space-y-8">
                <div>
                    <span className="text-[11px] font-bold tracking-[0.25em] text-[#5dbdf2] uppercase block mb-1">
                        CCG · PANEL DE CONTROL
                    </span>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Dashboard <span className="text-blue-600">Principal.</span>
                    </h1>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {cards.map((card) => (
                        <div
                            key={card.title}
                            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{card.title}</p>
                                <div
                                    className="p-2.5 rounded-xl border"
                                    style={{
                                        backgroundColor: `${card.color}15`,
                                        borderColor: `${card.color}40`,
                                        color: card.color,
                                    }}
                                >
                                    <card.icon className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-4xl font-black text-gray-900">
                                {card.value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-gray-900">Métricas y Progreso del Sistema</h2>
                            <p className="text-xs text-gray-500">Embudo de negocios, reservas y distribución</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Conversión Global (Citas → Cierres Ganados)</span>
                            <span className="text-sm font-black text-emerald-600">{conversionRate}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                                style={{ width: `${conversionRate}%` }}
                            />
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">{wonDeals} de {totalDeals} negocios ganados</p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div>
                            <h3 className="text-sm font-extrabold text-gray-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-500" />
                                Embudo de Negocios por Etapa
                            </h3>
                            <div className="space-y-3">
                                {funnelStats.map((item) => (
                                    <div key={item.stage} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-gray-600">{item.stage}</span>
                                            <span className="text-[11px] font-black text-gray-500">{item.count} ({item.percentage}%)</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${(item.count / maxFunnelCount) * 100}%`,
                                                    backgroundColor: stageColors[item.stage] || '#3b82f6',
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-extrabold text-gray-800 mb-4 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    Progreso de Reservas
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-gray-600">Completadas</span>
                                        <span className="text-[11px] font-black text-emerald-600">{reservationsStats.completed ?? 0}</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                            style={{ width: `${reservationsStats.completionRate ?? 0}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-gray-600">Pendientes</span>
                                        <span className="text-[11px] font-black text-amber-600">{reservationsStats.pending ?? 0}</span>
                                    </div>
                                    <p className="text-[11px] text-gray-500">Total: {reservationsStats.total ?? 0} reservas · {reservationsStats.completionRate ?? 0}% completadas</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-extrabold text-gray-800 mb-4 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-blue-500" />
                                    Negocios por Sede
                                </h3>
                                <div className="space-y-2">
                                    {dealsByCompany.map((company) => (
                                        <div key={company.name} className="flex items-center gap-3">
                                            <span className="text-[11px] font-bold text-gray-600 w-24 truncate">{company.name}</span>
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                                                    style={{ width: `${(company.count / maxCompanyCount) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-[11px] font-black text-gray-500 w-6 text-right">{company.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-extrabold text-gray-800 mb-3">Usuarios por Plan</h3>
                                <div className="flex gap-4">
                                    <div className="flex-1 p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
                                        <p className="text-2xl font-black text-blue-600">{usersByPlan.normal ?? 0}</p>
                                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Normal</p>
                                    </div>
                                    <div className="flex-1 p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
                                        <p className="text-2xl font-black text-amber-600">{usersByPlan.vip ?? 0}</p>
                                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">VIP</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {isSuperAdmin && allRequests.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-extrabold text-gray-900">Registro de Solicitudes</h2>
                                    <p className="text-xs text-gray-500">Historial de solicitudes de organización</p>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-600 border-b border-gray-200">
                                    <tr>
                                        <th className="py-3 px-6">Usuario</th>
                                        <th className="py-3 px-6">Contacto</th>
                                        <th className="py-3 px-6">Organización Solicitada</th>
                                        <th className="py-3 px-6 text-right">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allRequests.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                                            <td className="py-3 px-6">
                                                <Link
                                                    href={route('profile.visitor', user.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold text-sm text-gray-800 hover:text-blue-600 hover:bg-blue-50 transition"
                                                >
                                                    {user.name}
                                                </Link>
                                                <p className="text-xs text-gray-500">@{user.username}</p>
                                            </td>
                                            <td className="py-3 px-6">
                                                <p className="text-gray-600">{user.email}</p>
                                                <p className="text-xs text-gray-500">{user.phone || 'Sin teléfono'}</p>
                                            </td>
                                            <td className="py-3 px-6">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 border border-blue-200 text-blue-600">
                                                    {user.operacion}
                                                </span>
                                            </td>
                                            <td className="py-3 px-6 text-right">
                                                {user.status === 'pendiente' ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleApprove(user.id)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 transition-all"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                            Aprobar
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(user.id)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-all"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                            Rechazar
                                                        </button>
                                                    </div>
                                                ) : (
                                                    getStatusBadge(user.status)
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
