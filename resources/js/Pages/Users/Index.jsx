import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BackButton from '@/Components/BackButton';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ users, roles, companies = [] }) {
    const { auth } = usePage().props;
    const isSuperAdmin = auth?.user?.is_superadmin || 
        (Array.isArray(auth?.user?.roles) && auth.user.roles.some(r => String(r?.name || r).toLowerCase() === 'superadmin')) ||
        String(auth?.user?.role).toLowerCase() === 'superadmin';
    const isOrgAdmin = !isSuperAdmin;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
        company_id: auth?.user?.company_id || '',
        operacion: '',
        phone: '',
    });

    const {
        data: editData,
        setData: setEditData,
        put: editPut,
        processing: editProcessing,
        errors: editErrors,
    } = useForm({
        name: '',
        username: '',
        email: '',
        phone: '',
        operacion: '',
        company_id: '',
        role: '',
    });

    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter((user) => {
        const term = searchTerm.toLowerCase();
        const emailMatch = user.email?.toLowerCase().includes(term);
        const operacionMatch = user.operacion?.toLowerCase().includes(term);
        const nameMatch = user.name?.toLowerCase().includes(term);
        return emailMatch || operacionMatch || nameMatch;
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('users.store'), {
            onSuccess: () => {
                reset();
                setShowModal(false);
            },
        });
    };

    const openEdit = (user) => {
        setEditingUser(user);
        setEditData({
            name: user.name,
            username: user.username || '',
            email: user.email,
            phone: user.phone || '',
            operacion: user.operacion || '',
            company_id: auth?.user?.company_id || '',
            role: user.roles[0] || '',
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        editPut(route('users.update', editingUser.id), {
            onSuccess: () => setEditingUser(null),
        });
    };

    const handleToggleStatus = (user) => {
        router.patch(route('users.toggle-status', user.id));
    };

    const handleDelete = (user) => {
        if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            router.delete(route('users.destroy', user.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Usuarios" />
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Gestión de Usuarios
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Administra los usuarios y sus roles
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <BackButton href="/dashboard" />
                        {isSuperAdmin && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                            >
                                + Nuevo Usuario
                            </button>
                        )}
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-4 max-w-md">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                            🔍
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar por correo u organización..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-lg bg-white shadow-sm border border-slate-100">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Nombre
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Usuario
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Teléfono
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Organización
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Rol
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Fecha Creación
                                </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 min-w-[260px]">
                                    Acciones
                        </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                                        <Link
                                            href={route('profile.visitor', user.id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold text-sm text-gray-800 hover:text-blue-600 hover:bg-blue-50 transition"
                                        >
                                            {user.name}
                                        </Link>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                        {user.username || '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                        {user.email}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                        {user.phone || '-'}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                        {user.operacion || 'Sin Organización'}
                                    </td>
                                     <td className="whitespace-nowrap px-6 py-4">
                                         <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                                             {user.roles[0] || 'Sin rol'}
                                         </span>
                                     </td>
                                     <td className="whitespace-nowrap px-6 py-4">
                                         <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                             user.status === 'aprobado' ? 'bg-emerald-100 text-emerald-700' :
                                             user.status === 'pendiente' ? 'bg-amber-100 text-amber-700' :
                                             'bg-red-100 text-red-700'
                                         }`}>
                                             {user.status || 'aprobado'}
                                         </span>
                                     </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                        {user.created_at}
                                    </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium min-w-[260px]">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => openEdit(user)}
                                                        className="text-blue-600 hover:text-blue-900 font-semibold px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                                    >
                                                        Editar
                                                    </button>
                                                    {user.id !== auth.user.id && !user.roles?.includes('superadmin') ? (
                                                        <button
                                                            onClick={() => handleToggleStatus(user)}
                                                            className={`font-semibold px-2 py-1 rounded transition-colors ${
                                                                user.status === 'aprobado'
                                                                    ? 'text-amber-600 hover:text-amber-900 hover:bg-amber-50'
                                                                    : 'text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50'
                                                            }`}
                                                        >
                                                            {user.status === 'aprobado' ? 'Deshabilitar' : 'Habilitar'}
                                                        </button>
                                                    ) : (
                                                        <span className="invisible px-2 py-1 select-none font-semibold" aria-hidden="true">
                                                            Deshabilitar
                                                        </span>
                                                    )}
                                                     {isSuperAdmin && (
                                                         <button
                                                             onClick={() => handleDelete(user)}
                                                             className="text-red-600 hover:text-red-900 font-semibold px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                                         >
                                                             Eliminar
                                                         </button>
                                                     )}
                                                </div>
                                        </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                  </div>

                {/* Create Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Nuevo Usuario
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Confirmar Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Rol
                                    </label>
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">Seleccionar rol</option>
                                        <option value="admin">Admin</option>
                                        <option value="cliente">Cliente</option>
                                    </select>
                                    {errors.role && (
                                        <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                                    )}
                                </div>

                                {isSuperAdmin && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Organización / Empresa Asociada
                                        </label>
                                        <select
                                            value={data.company_id}
                                            onChange={(e) => setData('company_id', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">Sin Empresa (Global)</option>
                                            {companies.map((comp) => (
                                                <option key={comp.id} value={comp.id}>
                                                    {comp.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.company_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.company_id}</p>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Guardando...' : 'Crear Usuario'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {editingUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Editar Usuario</h3>

                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.name || ''}
                                        onChange={(e) => setEditData('name', e.target.value)}
                                        className="w-full bg-white border border-gray-200 !text-gray-900 font-semibold rounded-lg p-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Usuario
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.username || ''}
                                        onChange={(e) => setEditData('username', e.target.value)}
                                        className="w-full bg-white border border-gray-200 !text-gray-900 font-semibold rounded-lg p-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={editData.email || ''}
                                        onChange={(e) => setEditData('email', e.target.value)}
                                        className="w-full bg-white border border-gray-200 !text-gray-900 font-semibold rounded-lg p-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        value={editData.phone || ''}
                                        onChange={(e) => setEditData('phone', e.target.value)}
                                        className="w-full bg-white border border-gray-200 !text-gray-900 font-semibold rounded-lg p-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Organización
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.operacion || ''}
                                        onChange={(e) => setEditData('operacion', e.target.value)}
                                        className="w-full bg-white border border-gray-200 !text-gray-900 font-semibold rounded-lg p-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Rol
                                    </label>
                                    <select
                                        value={editData.role || ''}
                                        onChange={(e) => setEditData('role', e.target.value)}
                                        className="w-full bg-white border border-gray-200 !text-gray-900 font-bold rounded-lg p-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="admin" className="text-slate-900 bg-white font-medium">Admin</option>
                                        <option value="cliente" className="text-slate-900 bg-white font-medium">Cliente</option>
                                    </select>
                                </div>

                                {isSuperAdmin ? (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Organización / Empresa Asociada
                                        </label>
                                        <select
                                            value={editData.company_id || ''}
                                            onChange={(e) => setEditData('company_id', e.target.value)}
                                            className="w-full bg-white border border-gray-200 !text-gray-900 font-bold rounded-lg p-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Sin Empresa (Global)</option>
                                            {companies.map((comp) => (
                                                <option key={comp.id} value={comp.id}>
                                                    {comp.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Organización / Empresa Asociada
                                        </label>
                                        <input
                                            type="text"
                                            value={auth?.user?.company_id ? `Empresa #${auth.user.company_id}` : 'Sin empresa'}
                                            disabled
                                            className="w-full bg-gray-100 border border-gray-200 !text-gray-900 font-bold rounded-lg p-3 text-sm"
                                        />
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingUser(null)}
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
        </AuthenticatedLayout>
    );
}
