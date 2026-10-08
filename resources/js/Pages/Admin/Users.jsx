import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { UserCheck, Shield, Users, User, Edit2, Trash2, X, Check, Search, Plus } from 'lucide-react';

export default function UsersIndex({ users = [], roles = [] }) {
    const { auth } = usePage().props;
    const isSuperAdmin = auth.user?.roles?.includes('superadmin') || auth.user?.role === 'superadmin';

    const [selectedUser, setSelectedUser] = useState(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        role: '',
    });

    const openRoleModal = (user) => {
        setSelectedUser(user);
        setData('role', user.role || (user.roles && user.roles[0]?.name) || 'cliente');
        setIsRoleModalOpen(true);
    };

    const handleRoleSubmit = (e) => {
        e.preventDefault();
        put(route('users.update-role', selectedUser.id), {
            onSuccess: () => setIsRoleModalOpen(false),
        });
    };

    return (
        <>
            <Head title="Gestión de Usuarios - CCG"/>

            <div className="min-h-screen w-full bg-[#030811] text-slate-100 p-6 sm:p-10 relative overflow-hidden font-sans">
                {/* Glow Effects de fondo */}
                <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-[#0088cc]/10 rounded-full blur-[160px] pointer-events-none" />
                <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-[#00e1ff]/10 rounded-full blur-[180px] pointer-events-none" />

                <div className="max-w-7xl mx-auto space-y-8 z-10 relative">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#173e5f]/50 pb-6">
                        <div>
                            <span className="text-[11px] font-bold tracking-[0.25em] text-[#5dbdf2] uppercase block mb-1">
                                CCG · CONTROL DE ACCESO
                            </span>
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                Gestión de <span className="text-[#21a5e7]">Usuarios y Roles.</span>
                            </h1>
                        </div>
                    </div>

                    {/* Tarjetas Informativas de Roles */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#07101e]/90 backdrop-blur-2xl border border-[#173e5f] p-6 rounded-2xl shadow-[0_0_30px_rgba(0,180,240,0.1)] flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-[#637d9c] uppercase tracking-wider">Superadmins</p>
                                <p className="text-2xl font-black text-white mt-1">kevin@gmail.com</p>
                                <span className="text-[10px] text-[#2bd2f2] font-semibold mt-1 block">Acceso Total + Roles</span>
                            </div>
                            <div className="p-3.5 bg-[#0a1727] border border-[#21a5e7]/30 rounded-xl text-[#2bd2f2]">
                                <Shield className="w-6 h-6"/>
                            </div>
                        </div>

                        <div className="bg-[#07101e]/90 backdrop-blur-2xl border border-[#173e5f] p-6 rounded-2xl shadow-[0_0_30px_rgba(0,180,240,0.1)] flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-[#637d9c] uppercase tracking-wider">Administradores</p>
                                <p className="text-2xl font-black text-white mt-1">lola@gmail.com</p>
                                <span className="text-[10px] text-[#8b5cf6] font-semibold mt-1 block">Gestión de Empresa</span>
                            </div>
                            <div className="p-3.5 bg-[#0a1727] border border-[#8b5cf6]/30 rounded-xl text-[#8b5cf6]">
                                <UserCheck className="w-6 h-6"/>
                            </div>
                        </div>

                        <div className="bg-[#07101e]/90 backdrop-blur-2xl border border-[#173e5f] p-6 rounded-2xl shadow-[0_0_30px_rgba(0,180,240,0.1)] flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-[#637d9c] uppercase tracking-wider">Clientes</p>
                                <p className="text-2xl font-black text-white mt-1">palo@gmail.com</p>
                                <span className="text-[10px] text-[#10b981] font-semibold mt-1 block">Acceso Exclusivo Propio</span>
                            </div>
                            <div className="p-3.5 bg-[#0a1727] border border-[#10b981]/30 rounded-xl text-[#10b981]">
                                <Users className="w-6 h-6"/>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de Usuarios Glassmorphism */}
                    <div className="bg-[#07101e]/90 backdrop-blur-2xl border border-[#173e5f] rounded-[24px] overflow-hidden shadow-[0_0_50px_rgba(0,180,240,0.12)] relative">

                        {/* Línea Neón Superior */}
                        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#2bd2f2] to-transparent opacity-70" />

                        <div className="p-6 border-b border-[#173e5f]/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h2 className="text-lg font-extrabold text-white">Directorio de Usuarios</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-[#7d90a6]">
                                <thead className="bg-[#0a1727] text-xs font-bold uppercase tracking-wider text-[#5dbdf2] border-b border-[#173e5f]">
                                    <tr>
                                        <th className="py-4 px-6">Usuario</th>
                                        <th className="py-4 px-6">Email</th>
                                        <th className="py-4 px-6">Rol Actual</th>
                                        <th className="py-4 px-6">Empresa</th>
                                        {isSuperAdmin && <th className="py-4 px-6 text-right">Acciones</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#173e5f]/40">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-[#0a1727]/50 transition-colors">
                                            <td className="py-4 px-6 font-bold text-white flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-[#0a1727] border border-[#21a5e7]/30 flex items-center justify-center text-[#2bd2f2]">
                                                    <User className="w-4 h-4"/>
                                                </div>
                                                <span>{user.name}</span>
                                            </td>
                                            <td className="py-4 px-6 text-slate-300">{user.email}</td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                                                    user.role === 'superadmin'
                                                        ? 'bg-[#0284c7]/20 border-[#2bd2f2] text-[#2bd2f2]'
                                                        : user.role === 'admin'
                                                        ? 'bg-[#7c3aed]/20 border-[#8b5cf6] text-[#c084fc]'
                                                        : 'bg-[#059669]/20 border-[#10b981] text-[#34d399]'
                                                }`}>
                                                    {user.role || 'cliente'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-slate-400">
                                                {user.company_id ? `Empresa #${user.company_id}` : 'Global (CCG)'}
                                            </td>
                                            {isSuperAdmin && (
                                                <td className="py-4 px-6 text-right">
                                                    <button
                                                        onClick={() => openRoleModal(user)}
                                                        className="bg-[#0a1727] hover:bg-[#102238] border border-[#21a5e7]/40 text-[#2bd2f2] text-xs font-bold py-2 px-3.5 rounded-xl transition-all shadow-[0_0_12px_rgba(33,165,231,0.2)] inline-flex items-center gap-1.5"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5"/>
                                                        <span>Cambiar Rol</span>
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* Modal Editar Usuario */}
                {isRoleModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Editar Usuario</h3>

                            <form onSubmit={handleRoleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name || ''}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full bg-slate-100 border border-slate-300 !text-slate-900 font-semibold rounded-xl p-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email || ''}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full bg-slate-100 border border-slate-300 !text-slate-900 font-semibold rounded-xl p-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Rol
                                    </label>
                                    <select
                                        value={data.role || ''}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="w-full bg-slate-100 border border-slate-300 !text-slate-900 font-bold rounded-xl p-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="superadmin" className="text-slate-900 bg-white font-medium">Superadmin</option>
                                        <option value="admin" className="text-slate-900 bg-white font-medium">Admin</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsRoleModalOpen(false)}
                                        className="px-4 py-2 bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700"
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}
