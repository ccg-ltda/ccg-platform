import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BackButton from '@/Components/BackButton';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Building2, Plus, Edit2, Trash2, CheckCircle, Users, X, Search } from 'lucide-react';

export default function Index({ companies, totalCompanies = 0, activeCompanies = 0, linkedUsers = 0 }) {
    const { auth } = usePage().props;
    const isSuperAdmin = auth?.user?.is_superadmin ||
        (Array.isArray(auth?.user?.roles) && auth.user.roles.some(r => String(r?.name || r).toLowerCase() === 'superadmin')) ||
        String(auth?.user?.role).toLowerCase() === 'superadmin';

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        project: '',
        activity: '',
        status: 'activo',
    });

    const {
        data: editData,
        setData: setEditData,
        put: editPut,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit,
    } = useForm({
        name: '',
        project: '',
        activity: '',
        status: 'activo',
    });

    const [showModal, setShowModal] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCompanies = companies.filter((company) => {
        const term = searchTerm.toLowerCase();
        const nameMatch = company.name?.toLowerCase().includes(term);
        const projectMatch = company.project?.toLowerCase().includes(term);
        const activityMatch = company.activity?.toLowerCase().includes(term);
        return nameMatch || projectMatch || activityMatch;
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('companies.store'), {
            onSuccess: () => {
                reset();
                setShowModal(false);
            },
        });
    };

    const openEdit = (company) => {
        setEditingCompany(company);
        setEditData({
            name: company.name,
            project: company.project,
            activity: company.activity || '',
            status: company.status || 'activo',
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        editPut(route('companies.update', editingCompany.id), {
            onSuccess: () => {
                setEditingCompany(null);
                resetEdit();
            },
        });
    };

    const handleToggleStatus = (company) => {
        router.patch(route('companies.toggle-status', company.id));
    };

    const handleDelete = (company) => {
        if (confirm('¿Estás seguro de que deseas eliminar esta empresa / organización?')) {
            router.delete(route('companies.destroy', company.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestión de Empresas - CCG" />
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-bold tracking-[0.25em] text-blue-600 uppercase block mb-1">
                            CCG · ADMINISTRACIÓN CENTRAL
                        </span>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            Gestión de <span className="text-blue-700">Empresas y Organizaciones</span>
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Administra las empresas, proyectos y líneas de negocio asociadas a la plataforma
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <BackButton href="/dashboard" />
                        {isSuperAdmin && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg transition-all shadow-sm inline-flex items-center gap-2 text-sm"
                            >
                                <Plus className="w-4 h-4 stroke-[3]" />
                                <span>+ Nueva Empresa</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-t-4 border-t-blue-500">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                                <Building2 className="w-5 h-5"/>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Total Empresas</p>
                                <p className="text-2xl font-black text-slate-900">{totalCompanies}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-t-4 border-t-emerald-500">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                                <CheckCircle className="w-5 h-5"/>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Empresas Activas</p>
                                <p className="text-2xl font-black text-slate-900">{activeCompanies}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-t-4 border-t-violet-500">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
                                <Users className="w-5 h-5"/>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Usuarios Vinculados</p>
                                <p className="text-2xl font-black text-slate-900">{linkedUsers}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6 max-w-md">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                            <Search className="w-4 h-4" />
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar por organización, proyecto o actividad..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-700">
                            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                <tr>
                                    <th className="py-3 px-6">Organización</th>
                                    <th className="py-3 px-6">Proyecto</th>
                                    <th className="py-3 px-6">Actividad / Rubro</th>
                                    <th className="py-3 px-6">Estado</th>
                                    {isSuperAdmin && (
                                        <th className="py-3 px-6 text-right min-w-[220px]">Acciones</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCompanies.length > 0 ? (
                                    filteredCompanies.map((company) => (
                                        <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-3 px-6 font-bold text-slate-900 flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                                                    <Building2 className="w-4 h-4" />
                                                </div>
                                                <span>{company.name}</span>
                                            </td>
                                            <td className="py-3 px-6 text-slate-700 font-medium">
                                                {company.project}
                                            </td>
                                            <td className="py-3 px-6 text-slate-500 max-w-xs truncate">
                                                {company.activity || 'Sin especificar'}
                                            </td>
                                            <td className="py-3 px-6">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                    company.status === 'activo'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                    {company.status || 'activo'}
                                                </span>
                                            </td>
                                            {isSuperAdmin && (
                                                <td className="py-3 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEdit(company)}
                                                            className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-medium py-1.5 px-3 rounded-lg transition-all inline-flex items-center gap-1"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                            <span>Editar</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleStatus(company)}
                                                            className={`text-xs font-medium py-1.5 px-3 rounded-lg transition-all border ${
                                                                company.status === 'activo'
                                                                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700'
                                                                    : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700'
                                                            }`}
                                                        >
                                                            {company.status === 'activo' ? 'Inhabilitar' : 'Habilitar'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(company)}
                                                            className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-medium py-1.5 px-3 rounded-lg transition-all inline-flex items-center gap-1"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-400">
                                            No se encontraron empresas u organizaciones registradas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-md w-full shadow-xl text-gray-900">
                            <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-blue-600" />
                                    <span>Nueva Empresa / Organización</span>
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Nombre de la Organización / Empresa
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                                        placeholder="Ej. Corporación Minera del Norte"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-xs text-rose-500">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Proyecto Asignado
                                    </label>
                                    <input
                                        type="text"
                                        value={data.project}
                                        onChange={(e) => setData('project', e.target.value)}
                                        className="w-full bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                                        placeholder="Ej. Proyecto Tía María"
                                        required
                                    />
                                    {errors.project && (
                                        <p className="mt-1 text-xs text-rose-500">{errors.project}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Actividad / Rubro
                                    </label>
                                    <textarea
                                        value={data.activity}
                                        onChange={(e) => setData('activity', e.target.value)}
                                        rows={3}
                                        className="w-full bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none shadow-sm"
                                        placeholder="Descripción de la línea de negocio u operación..."
                                    />
                                    {errors.activity && (
                                        <p className="mt-1 text-xs text-rose-500">{errors.activity}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Estado Inicial
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                                    >
                                        <option value="activo">Activo</option>
                                        <option value="inactivo">Inactivo</option>
                                    </select>
                                    {errors.status && (
                                        <p className="mt-1 text-xs text-rose-500">{errors.status}</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 font-medium rounded-lg text-xs"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs shadow-sm disabled:opacity-50"
                                    >
                                        {processing ? 'Guardando...' : 'Crear Empresa'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {editingCompany && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-md w-full shadow-xl text-gray-900">
                            <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-blue-600" />
                                    <span>Editar Empresa / Organización</span>
                                </h3>
                                <button
                                    onClick={() => setEditingCompany(null)}
                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Nombre de la Organización / Empresa
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.name}
                                        onChange={(e) => setEditData('name', e.target.value)}
                                        className="w-full bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                                        required
                                    />
                                    {editErrors.name && (
                                        <p className="mt-1 text-xs text-rose-500">{editErrors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Proyecto Asignado
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.project}
                                        onChange={(e) => setEditData('project', e.target.value)}
                                        className="w-full bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                                        required
                                    />
                                    {editErrors.project && (
                                        <p className="mt-1 text-xs text-rose-500">{editErrors.project}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Actividad / Rubro
                                    </label>
                                    <textarea
                                        value={editData.activity}
                                        onChange={(e) => setEditData('activity', e.target.value)}
                                        rows={3}
                                        className="w-full bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none shadow-sm"
                                    />
                                    {editErrors.activity && (
                                        <p className="mt-1 text-xs text-rose-500">{editErrors.activity}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Estado
                                    </label>
                                    <select
                                        value={editData.status}
                                        onChange={(e) => setEditData('status', e.target.value)}
                                        className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                                    >
                                        <option value="activo">Activo</option>
                                        <option value="inactivo">Inactivo</option>
                                    </select>
                                    {editErrors.status && (
                                        <p className="mt-1 text-xs text-rose-500">{editErrors.status}</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditingCompany(null)}
                                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 font-medium rounded-lg text-xs"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editProcessing}
                                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs shadow-sm disabled:opacity-50"
                                    >
                                        {editProcessing ? 'Guardando...' : 'Actualizar Empresa'}
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
