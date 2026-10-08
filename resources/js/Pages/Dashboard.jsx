import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { Users, Shield, Key, Clock, Check, X } from 'lucide-react';

export default function Dashboard({ stats }) {
    const { auth } = usePage().props;
    const isSuperAdmin = auth.user?.roles?.[0]?.name === 'superadmin' || auth.user?.role === 'superadmin';
    const pendingUsers = stats?.pendingUsers ?? [];

    const cards = [
        { title: 'Total Usuarios', value: stats?.users ?? 0, icon: Users, color: '#2bd2f2' },
        { title: 'Roles Activos', value: stats?.roles ?? 0, icon: Shield, color: '#8b5cf6' },
        { title: 'Permisos', value: stats?.permissions ?? 0, icon: Key, color: '#10b981' },
    ];

    const handleApprove = (userId) => {
        router.post(route('users.approve', userId));
    };

    const handleReject = (userId) => {
        if (window.confirm('¿Estás seguro de rechazar esta solicitud?')) {
            router.post(route('users.reject', userId));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard - CCG" />

            <div className="space-y-8">
                <div>
                    <span className="text-[11px] font-bold tracking-[0.25em] text-[#5dbdf2] uppercase block mb-1">
                        CCG · PANEL DE CONTROL
                    </span>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Dashboard <span className="text-[#21a5e7]">Principal.</span>
                    </h1>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {cards.map((card) => (
                        <div
                            key={card.title}
                            className="bg-[#07101e]/90 backdrop-blur-2xl border border-[#173e5f] p-6 rounded-2xl shadow-[0_0_30px_rgba(0,180,240,0.1)] relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#2bd2f2] to-transparent opacity-50" />
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-xs font-bold text-[#637d9c] uppercase tracking-wider">{card.title}</p>
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
                            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#7b97b8]">
                                {card.value}
                            </p>
                        </div>
                    ))}
                </div>

                {isSuperAdmin && pendingUsers.length > 0 && (
                    <div className="bg-[#07101e]/90 backdrop-blur-2xl border border-[#173e5f] rounded-2xl shadow-[0_0_30px_rgba(0,180,240,0.1)] overflow-hidden">
                        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#2bd2f2] to-transparent opacity-50" />
                        <div className="p-6 border-b border-[#173e5f]/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-extrabold text-white">Solicitudes Pendientes</h2>
                                    <p className="text-xs text-[#637d9c]">Usuarios esperando aprobación de organización</p>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#0a1727] text-xs font-bold uppercase tracking-wider text-[#5dbdf2] border-b border-[#173e5f]">
                                    <tr>
                                        <th className="py-3 px-6">Usuario</th>
                                        <th className="py-3 px-6">Contacto</th>
                                        <th className="py-3 px-6">Organización Solicitada</th>
                                        <th className="py-3 px-6 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#173e5f]/40">
                                    {pendingUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-[#0a1727]/50 transition-colors">
                                            <td className="py-3 px-6">
                                                <p className="font-bold text-white">{user.name}</p>
                                                <p className="text-xs text-[#637d9c]">@{user.username}</p>
                                            </td>
                                            <td className="py-3 px-6">
                                                <p className="text-slate-300">{user.email}</p>
                                                <p className="text-xs text-[#637d9c]">{user.phone || 'Sin teléfono'}</p>
                                            </td>
                                            <td className="py-3 px-6">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                                                    {user.operacion}
                                                </span>
                                            </td>
                                            <td className="py-3 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleApprove(user.id)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                        Aprobar
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(user.id)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 transition-all"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                        Rechazar
                                                    </button>
                                                </div>
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
