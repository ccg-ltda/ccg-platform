import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';

export default function Settings({ auth, users = [], roles = [], permissions = [], companies = [], branches = [], plans = [], totalCompanies = 0, activeCompanies = 0, linkedUsers = 0, isSuperAdmin = false, canViewUsers = true, systemPreferences = {}, currentTab = 'general', filters = {} }) {
    const urlParams = new URLSearchParams(window.location.search);
    const [activeTab, setActiveTab] = useState(urlParams.get('tab') || currentTab || 'general');

    // System preferences state
    const [preferences, setPreferences] = useState({
        currency: systemPreferences?.currency || 'COP',
        tax_name: systemPreferences?.tax_name || 'IVA',
        tax_rate: systemPreferences?.tax_rate ?? 19,
        timezone: systemPreferences?.timezone || 'America/Bogota',
    });

    const handleTaxPresetChange = (e) => {
        const val = e.target.value;
        let name = 'IVA';
        let rate = 19;
        if (val === 'itbis') {
            name = 'ITBIS';
            rate = 18;
        } else if (val === 'custom') {
            name = 'Personalizado / Exento';
            rate = 0;
        }
        setPreferences(prev => ({ ...prev, tax_name: name, tax_rate: rate }));
    };

    const handlePreferencesSave = (e) => {
        e.preventDefault();
        fetch('/api/settings/preferences', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(preferences),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Las preferencias del sistema han sido actualizadas correctamente.');
            }
        })
        .catch(error => console.error('Error al actualizar preferencias:', error));
    };

    // Role permissions state management
    const ROLE_ORDER = ['superadmin', 'admin', 'cliente'];
    const rolesList = (roles || [])
        .filter(role => ROLE_ORDER.includes(role.raw_name || role.name || ''))
        .sort((a, b) => ROLE_ORDER.indexOf(a.raw_name || a.name || '') - ROLE_ORDER.indexOf(b.raw_name || b.name || ''));
    const permissionsList = permissions || [];

    const PERMISSION_LABELS = {
        'view-dashboard': 'Ver Panel Principal (Dashboard)',
        'view-users': 'Ver Lista de Usuarios',
        'manage-users': 'Gestionar Usuarios',
        'manage-companies': 'Gestionar Empresas',
        'manage-branches': 'Gestionar Sucursales',
        'manage-plans': 'Gestionar Planes y Licencias',
        'view-reports': 'Ver Reportes y Métricas',
        'manage-deals': 'Crear / Gestionar Negocios',
        'manage-reservations': 'Agendar / Gestionar Reservas',
        'manage-bookings': 'Agendar / Gestionar Reservas',
        'manage-settings': 'Gestionar Configuración / Preferencias',
    };

    const getPermissionLabel = (name) => PERMISSION_LABELS[name] || name;

    const DEFAULT_ADMIN_PERMISSIONS = [
        'view-dashboard',
        'manage-users',
        'view-users',
        'manage-branches',
        'view-reports',
        'manage-deals',
        'manage-bookings',
    ];

    const DEFAULT_CLIENTE_PERMISSIONS = [
        'view-dashboard',
        'manage-bookings',
    ];

    const getDefaultPermissions = (roleName) => {
        if (roleName === 'admin') return DEFAULT_ADMIN_PERMISSIONS;
        if (roleName === 'cliente') return DEFAULT_CLIENTE_PERMISSIONS;
        return [];
    };

    const findRole = (roleName) => (roles || []).find(r => (r.raw_name || r.name || '').toLowerCase() === roleName);

    const [rolePermissionsState, setRolePermissionsState] = useState(() => {
        const state = {};
        rolesList.forEach(role => {
            const roleName = (role.raw_name || role.name || '').toLowerCase();
            const perms = role.permissions && role.permissions.length > 0
                ? role.permissions
                : getDefaultPermissions(roleName);
            state[roleName] = perms;
        });
        return state;
    });

    const isRolePermissionChecked = (roleName, permissionKey) => {
        return (rolePermissionsState[roleName] || []).includes(permissionKey);
    };

    const handlePermissionToggle = (roleName, permissionName) => {
        setRolePermissionsState(prev => {
            const currentPerms = prev[roleName] || [];
            const updated = currentPerms.includes(permissionName)
                ? currentPerms.filter(p => p !== permissionName)
                : [...currentPerms, permissionName];
            return { ...prev, [roleName]: updated };
        });
    };

    const saveAllRolePermissions = (e) => {
        e.preventDefault();
        const rolesPayload = rolesList.map(role => {
            const roleName = (role.raw_name || role.name || '').toLowerCase();
            return {
                role_id: role.id,
                permissions: rolePermissionsState[roleName] || [],
            };
        });
        router.put(route('settings.permissions.update'), {
            roles: rolesPayload,
        }, {
            preserveScroll: true,
            onSuccess: () => alert('Permisos actualizados correctamente.'),
        });
    };

    // User management state
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
    } = useForm({
        name: '',
        username: '',
        email: '',
        phone: '',
        operacion: '',
        company_id: '',
        role: '',
    });

    // Company management state
    const [showCompanyModal, setShowCompanyModal] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);
    const [companySearchTerm, setCompanySearchTerm] = useState('');
    const { data: companyData, setData: setCompanyData, post: postCompany, put: putCompany, reset: resetCompany, errors: companyErrors } = useForm({
        name: '',
        project: '',
        activity: '',
        status: 'activo',
    });

    const filteredCompanies = companies.filter(c => {
        const term = companySearchTerm.toLowerCase();
        return c.name?.toLowerCase().includes(term) || c.project?.toLowerCase().includes(term) || c.activity?.toLowerCase().includes(term);
    });

    // Branch management state
    const [showBranchModal, setShowBranchModal] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const { data: branchData, setData: setBranchData, post: postBranch, put: putBranch, reset: resetBranch, errors: branchErrors } = useForm({
        company_id: auth?.user?.company_id || '',
        name: '',
        address: '',
        phone: '',
        status: 'activo',
    });

    // Plan assignment state
    const [selectedCompanyForPlan, setSelectedCompanyForPlan] = useState('');
    const [selectedPlanType, setSelectedPlanType] = useState('normal');

    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrganizationId, setSelectedOrganizationId] = useState(filters?.organization_id || '');

    const filteredUsers = users.filter((user) => {
        const term = searchTerm.toLowerCase();
        return user.email?.toLowerCase().includes(term) || user.operacion?.toLowerCase().includes(term) || user.name?.toLowerCase().includes(term);
    });

    const handleOrgFilterChange = (e) => {
        const orgId = e.target.value;
        setSelectedOrganizationId(orgId);
        router.get(route('settings.index'), { tab: activeTab, organization_id: orgId }, { preserveState: true, replace: true });
    };

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
            company_id: user.company_id || auth?.user?.company_id || '',
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
        <AuthenticatedLayout user={auth.user}>
            <Head title="Configuración de la Plataforma" />
            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
                    <p className="text-sm text-gray-500">Administración general de la plataforma, preferencias, usuarios, roles, empresas y sucursales</p>
                </div>

                {/* Tabs Navigation in Exact Required Order */}
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`py-3 px-6 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                            activeTab === 'general' || activeTab === 'preferences'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        ⚙️ Preferencias
                    </button>
                    {(isSuperAdmin || canViewUsers) && (
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`py-3 px-6 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                                activeTab === 'users'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            👥 Gestión de Usuarios
                        </button>
                    )}
                    {isSuperAdmin && (
                        <button
                            onClick={() => setActiveTab('roles')}
                            className={`py-3 px-6 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                                activeTab === 'roles'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            🛡️ Roles y Permisos
                        </button>
                    )}
                    {isSuperAdmin && (
                        <button
                            onClick={() => setActiveTab('companies')}
                            className={`py-3 px-6 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                                activeTab === 'companies'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            🏢 Empresas
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('branches')}
                        className={`py-3 px-6 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                            activeTab === 'branches'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        🏪 Sucursales
                    </button>
                    {isSuperAdmin && (
                        <button
                            onClick={() => setActiveTab('plans')}
                            className={`py-3 px-6 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                                activeTab === 'plans'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            👑 Planes / Licencias
                        </button>
                    )}
                </div>

                {/* Tab 1: Preferences / General */}
                {(activeTab === 'general' || activeTab === 'preferences') && (
                    <form onSubmit={handlePreferencesSave} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6 max-w-4xl">
                        <h2 className="text-lg font-bold text-gray-900">Preferencias del Sistema</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Moneda Predeterminada
                                </label>
                                <select
                                    value={preferences.currency}
                                    onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 p-3 text-sm font-medium focus:border-blue-500 focus:ring-blue-500 outline-none"
                                >
                                    <option value="COP">$ Peso Colombiano (COP)</option>
                                    <option value="USD">$ Dólar Estadounidense (USD)</option>
                                    <option value="EUR">€ Euro (EUR)</option>
                                    <option value="MXN">$ Peso Mexicano (MXN)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Zona Horaria (Timezone)
                                </label>
                                <select
                                    value={preferences.timezone}
                                    onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 p-3 text-sm font-medium focus:border-blue-500 focus:ring-blue-500 outline-none"
                                >
                                    <option value="America/Bogota">America/Bogota (Colombia / UTC-5)</option>
                                    <option value="America/Santo_Domingo">America/Santo_Domingo (República Dominicana / UTC-4)</option>
                                    <option value="America/Mexico_City">America/Mexico_City (México / UTC-6)</option>
                                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Impuesto Aplicable (Preset)
                                </label>
                                <select
                                    onChange={handleTaxPresetChange}
                                    className="w-full rounded-xl border-gray-200 p-3 text-sm font-medium focus:border-blue-500 focus:ring-blue-500 outline-none"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Seleccionar preset...</option>
                                    <option value="iva">IVA (Colombia) - 19%</option>
                                    <option value="itbis">ITBIS (República Dominicana) - 18%</option>
                                    <option value="custom">Personalizado / Exento (0%)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Nombre Impuesto
                                    </label>
                                    <input
                                        type="text"
                                        value={preferences.tax_name}
                                        onChange={(e) => setPreferences({ ...preferences, tax_name: e.target.value })}
                                        className="w-full rounded-xl border-gray-200 p-3 text-sm font-medium focus:border-blue-500 focus:ring-blue-500 outline-none"
                                        placeholder="Ej. IVA"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Tasa (%)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={preferences.tax_rate}
                                        onChange={(e) => setPreferences({ ...preferences, tax_rate: parseFloat(e.target.value) || 0 })}
                                        className="w-full rounded-xl border-gray-200 p-3 text-sm font-medium focus:border-blue-500 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                                Los valores se configuran globalmente para toda la plataforma y cotizaciones.
                            </p>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition"
                            >
                                Guardar Preferencias
                            </button>
                        </div>
                    </form>
                )}

                {/* Tab 2: User Management */}
                {activeTab === 'users' && (isSuperAdmin || canViewUsers) && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    Gestión de Usuarios por Sede / Organización
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {isSuperAdmin ? 'Vista de Superadmin: administración global con selector de sede' : 'Vista de Administrador: filtrado automático a su sede/organización'}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {isSuperAdmin && (
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs font-bold text-gray-600 uppercase">Filtrar Sede:</label>
                                        <select
                                            value={selectedOrganizationId}
                                            onChange={handleOrgFilterChange}
                                            className="rounded-lg border-gray-300 text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Todas las sedes</option>
                                            {companies.map(comp => (
                                                <option key={comp.id} value={comp.id}>{comp.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                >
                                    + Nuevo Usuario
                                </button>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="max-w-md">
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

                        {/* Users Table */}
                        <div className="overflow-x-auto rounded-lg bg-white shadow-sm border border-slate-100">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Nombre</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Usuario</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Teléfono</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Organización / Sede</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Rol</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Fecha Creación</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 min-w-[260px]">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                                                <Link
                                                    href={route('profile.visitor', user.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold text-sm text-gray-800 hover:text-blue-600 hover:bg-blue-50 transition"
                                                >
                                                    {user.name}
                                                </Link>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{user.username || '-'}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{user.email}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{user.phone || '-'}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{user.company_name || user.operacion || 'Sin Organización'}</td>
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
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{user.created_at}</td>
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
                                    )) : (
                                        <tr>
                                            <td colSpan="9" className="text-center py-8 text-sm text-gray-500">
                                                No se encontraron usuarios.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Create Modal */}
                        {showModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                                <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-800">Nuevo Usuario</h3>
                                        <button onClick={() => setShowModal(false)} className="rounded-md p-1 text-gray-400 hover:bg-gray-100">✕</button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2.5 border"
                                                required
                                            />
                                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2.5 border"
                                                required
                                            />
                                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                                            <input
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2.5 border"
                                                required
                                            />
                                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                                            <input
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2.5 border"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Rol</label>
                                            <select
                                                value={data.role}
                                                onChange={(e) => setData('role', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2.5 border"
                                                required
                                            >
                                                <option value="">Seleccionar rol</option>
                                                {isSuperAdmin && <option value="superadmin">Superadmin</option>}
                                                <option value="admin">Admin</option>
                                                <option value="cliente">Cliente</option>
                                            </select>
                                            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
                                        </div>

                                        {isSuperAdmin && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Organización / Sede Asociada</label>
                                                <select
                                                    value={data.company_id}
                                                    onChange={(e) => setData('company_id', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2.5 border"
                                                >
                                                    <option value="">Sin Empresa (Global)</option>
                                                    {companies.map((comp) => (
                                                        <option key={comp.id} value={comp.id}>{comp.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-3 pt-2">
                                            <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border px-4 py-2 text-sm">Cancelar</button>
                                            <button type="submit" disabled={processing} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">Crear Usuario</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Edit Modal */}
                        {editingUser && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                                <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border">
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">Editar Usuario</h3>

                                    <form onSubmit={handleEditSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Nombre</label>
                                            <input
                                                type="text"
                                                value={editData.name || ''}
                                                onChange={(e) => setEditData('name', e.target.value)}
                                                className="w-full border rounded-lg p-3 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={editData.email || ''}
                                                onChange={(e) => setEditData('email', e.target.value)}
                                                className="w-full border rounded-lg p-3 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Rol</label>
                                            <select
                                                value={editData.role || ''}
                                                onChange={(e) => setEditData('role', e.target.value)}
                                                className="w-full border rounded-lg p-3 text-sm font-bold"
                                            >
                                                {isSuperAdmin && <option value="superadmin">Superadmin</option>}
                                                <option value="admin">Admin</option>
                                                <option value="cliente">Cliente</option>
                                            </select>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-4">
                                            <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 bg-slate-200 rounded-xl text-xs font-bold">Cancelar</button>
                                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Guardar</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 3: Roles and Permissions (Superadmin only) */}
                {activeTab === 'roles' && isSuperAdmin && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Matriz de Roles y Permisos</h2>
                            <p className="text-sm text-gray-500">Activa o desactiva permisos específicos para cada rol del sistema.</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Permiso / Módulo</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">SUPERADMIN</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">ADMIN</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">CLIENTE</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {permissionsList.map(permission => {
                                            const permName = permission.name || permission;

                                            return (
                                                <tr key={permName} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getPermissionLabel(permName)}</td>

                                                    {/* SUPERADMIN: marcado y desactivado */}
                                                    <td key="superadmin-cell" className="px-6 py-4 whitespace-nowrap text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isRolePermissionChecked('superadmin', permName)}
                                                            disabled={true}
                                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                        />
                                                    </td>

                                                    {/* ADMIN: interactivo */}
                                                    <td key="admin-cell" className="px-6 py-4 whitespace-nowrap text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isRolePermissionChecked('admin', permName)}
                                                            onChange={() => handlePermissionToggle('admin', permName)}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                                        />
                                                    </td>

                                                    {/* CLIENTE: interactivo */}
                                                    <td key="cliente-cell" className="px-6 py-4 whitespace-nowrap text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isRolePermissionChecked('cliente', permName)}
                                                            onChange={() => handlePermissionToggle('cliente', permName)}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                                <button
                                    onClick={saveAllRolePermissions}
                                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition"
                                >
                                    Guardar Cambios de Permisos
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 4: Companies (Empresas) */}
                {activeTab === 'companies' && isSuperAdmin && (
                    <div className="space-y-6">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-t-4 border-t-blue-500">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        🏢
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Total Empresas</p>
                                        <p className="text-2xl font-black text-slate-900">{totalCompanies || companies.length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-t-4 border-t-emerald-500">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                                        ✅
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Empresas Activas</p>
                                        <p className="text-2xl font-black text-slate-900">{activeCompanies || companies.filter(c => c.status === 'activo').length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-t-4 border-t-violet-500">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 font-bold">
                                        👥
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Usuarios Vinculados</p>
                                        <p className="text-2xl font-black text-slate-900">{linkedUsers || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Gestión de Empresas / Organizaciones</h2>
                                <p className="text-sm text-gray-500">Crea, edita y administra las empresas registradas en la plataforma</p>
                            </div>
                            <button
                                onClick={() => {
                                    resetCompany();
                                    setEditingCompany(null);
                                    setShowCompanyModal(true);
                                }}
                                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 shadow-sm"
                            >
                                + Nueva Empresa
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="max-w-md">
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                                    🔍
                                </span>
                                <input
                                    type="text"
                                    placeholder="Buscar por organización, proyecto o actividad..."
                                    value={companySearchTerm}
                                    onChange={(e) => setCompanySearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm rounded-lg focus:outline-none focus:border-blue-500 shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-lg bg-white shadow-sm border border-slate-100">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Organización</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Proyecto</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Gestión</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {filteredCompanies.map(comp => (
                                        <tr key={comp.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-sm font-bold text-slate-900">{comp.name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{comp.project}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${comp.status === 'activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {comp.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                                                <Link
                                                    href={route('quotations.index', { company_id: comp.id })}
                                                    className="text-blue-600 hover:text-blue-900 font-semibold"
                                                >
                                                    Cotizaciones
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setEditingCompany(comp);
                                                        setCompanyData({ name: comp.name, project: comp.project, activity: comp.activity || '', status: comp.status });
                                                        setShowCompanyModal(true);
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-900 font-semibold"
                                                >
                                                    Ver / Editar
                                                </button>
                                                <button
                                                    onClick={() => router.patch(route('companies.toggle-status', comp.id))}
                                                    className="text-amber-600 hover:text-amber-900 font-semibold"
                                                >
                                                    {comp.status === 'activo' ? 'Desactivar' : 'Activar'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Company Modal */}
                        {showCompanyModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                                <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                                    <h3 className="text-lg font-bold mb-4">{editingCompany ? 'Editar Empresa' : 'Nueva Empresa'}</h3>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        if (editingCompany) {
                                            putCompany(route('companies.update', editingCompany.id), { onSuccess: () => setShowCompanyModal(false) });
                                        } else {
                                            postCompany(route('companies.store'), { onSuccess: () => setShowCompanyModal(false) });
                                        }
                                    }} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Nombre</label>
                                            <input
                                                type="text"
                                                value={companyData.name}
                                                onChange={e => setCompanyData('name', e.target.value)}
                                                className="w-full border rounded-lg p-2.5 text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Proyecto</label>
                                            <input
                                                type="text"
                                                value={companyData.project}
                                                onChange={e => setCompanyData('project', e.target.value)}
                                                className="w-full border rounded-lg p-2.5 text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Actividad</label>
                                            <textarea
                                                value={companyData.activity}
                                                onChange={e => setCompanyData('activity', e.target.value)}
                                                className="w-full border rounded-lg p-2.5 text-sm"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3 pt-2">
                                            <button type="button" onClick={() => setShowCompanyModal(false)} className="px-4 py-2 border rounded-lg text-sm">Cancelar</button>
                                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">Guardar</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 5: Branches (Sucursales) */}
                {activeTab === 'branches' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Gestión de Sucursales</h2>
                                <p className="text-sm text-gray-500">Administra las sucursales asociadas a cada empresa</p>
                            </div>
                            <button
                                onClick={() => {
                                    resetBranch();
                                    setEditingBranch(null);
                                    setShowBranchModal(true);
                                }}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                + Nueva Sucursal
                            </button>
                        </div>

                        <div className="overflow-x-auto rounded-lg bg-white shadow-sm border border-slate-100">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Sucursal</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Empresa Padre</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Dirección</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Teléfono</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {branches.length > 0 ? branches.map(branch => (
                                        <tr key={branch.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-sm font-bold text-slate-900">{branch.name}</td>
                                            <td className="px-6 py-4 text-sm text-indigo-600 font-medium">{branch.company_name || 'Sin empresa'}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{branch.address || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{branch.phone || '-'}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${branch.status === 'activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {branch.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingBranch(branch);
                                                        setBranchData({ company_id: branch.company_id, name: branch.name, address: branch.address || '', phone: branch.phone || '', status: branch.status });
                                                        setShowBranchModal(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900 font-semibold"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => router.patch(route('settings.branches.toggle-status', branch.id))}
                                                    className="text-amber-600 hover:text-amber-900 font-semibold"
                                                >
                                                    {branch.status === 'activo' ? 'Desactivar' : 'Activar'}
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-8 text-sm text-gray-500">No se encontraron sucursales.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Branch Modal */}
                        {showBranchModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                                <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                                    <h3 className="text-lg font-bold mb-4">{editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}</h3>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        if (editingBranch) {
                                            putBranch(route('settings.branches.update', editingBranch.id), { onSuccess: () => setShowBranchModal(false) });
                                        } else {
                                            postBranch(route('settings.branches.store'), { onSuccess: () => setShowBranchModal(false) });
                                        }
                                    }} className="space-y-4">
                                        {isSuperAdmin && (
                                            <div>
                                                <label className="block text-xs font-bold uppercase mb-1">Empresa Padre</label>
                                                <select
                                                    value={branchData.company_id}
                                                    onChange={e => setBranchData('company_id', e.target.value)}
                                                    className="w-full border rounded-lg p-2.5 text-sm font-bold"
                                                    required
                                                >
                                                    <option value="">Seleccionar empresa...</option>
                                                    {companies.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Nombre de Sucursal</label>
                                            <input
                                                type="text"
                                                value={branchData.name}
                                                onChange={e => setBranchData('name', e.target.value)}
                                                className="w-full border rounded-lg p-2.5 text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Dirección</label>
                                            <input
                                                type="text"
                                                value={branchData.address}
                                                onChange={e => setBranchData('address', e.target.value)}
                                                className="w-full border rounded-lg p-2.5 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Teléfono</label>
                                            <input
                                                type="text"
                                                value={branchData.phone}
                                                onChange={e => setBranchData('phone', e.target.value)}
                                                className="w-full border rounded-lg p-2.5 text-sm"
                                            />
                                        </div>
                                        {editingBranch && (
                                            <div>
                                                <label className="block text-xs font-bold uppercase mb-1">Estado</label>
                                                <select
                                                    value={branchData.status}
                                                    onChange={e => setBranchData('status', e.target.value)}
                                                    className="w-full border rounded-lg p-2.5 text-sm font-bold"
                                                >
                                                    <option value="activo">Activo</option>
                                                    <option value="inactivo">Inactivo</option>
                                                </select>
                                            </div>
                                        )}
                                        <div className="flex justify-end gap-3 pt-2">
                                            <button type="button" onClick={() => setShowBranchModal(false)} className="px-4 py-2 border rounded-lg text-sm">Cancelar</button>
                                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">Guardar</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 6: Plans / Licencias (Superadmin only) */}
                {activeTab === 'plans' && isSuperAdmin && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Planes y Licencias del Sistema</h2>
                            <p className="text-sm text-gray-500">Define planes y asigna o renueva licencias para las empresas</p>
                        </div>

                        {/* Available Plans Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {plans.map(plan => (
                                <div key={plan.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between space-y-4">
                                    <div>
                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-black uppercase rounded-full">{plan.id}</span>
                                        <h3 className="text-lg font-bold text-gray-900 mt-2">{plan.name}</h3>
                                        <p className="text-2xl font-black text-blue-600 mt-1">{plan.price}</p>
                                    </div>
                                    <ul className="text-xs text-gray-600 space-y-2 border-t border-b border-gray-100 py-3">
                                        <li>👥 Límite de Usuarios: <span className="font-bold">{plan.max_users}</span></li>
                                        <li>🏪 Sucursales Permitidas: <span className="font-bold">{plan.max_branches}</span></li>
                                        <li>⏳ Vigencia: <span className="font-bold">1 Año (Renovable)</span></li>
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Assign Plan to Company Form */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 max-w-xl space-y-4">
                            <h3 className="text-lg font-bold text-gray-900">Asignar o Renovar Licencia de Empresa</h3>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                router.post(route('settings.assign-plan'), {
                                    company_id: selectedCompanyForPlan,
                                    plan_type: selectedPlanType,
                                }, {
                                    onSuccess: () => alert('Licencia asignada correctamente.'),
                                });
                            }} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1">Seleccionar Empresa</label>
                                    <select
                                        value={selectedCompanyForPlan}
                                        onChange={e => setSelectedCompanyForPlan(e.target.value)}
                                        className="w-full border rounded-lg p-3 text-sm font-bold"
                                        required
                                    >
                                        <option value="">Seleccionar empresa...</option>
                                        {companies.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.plan_type || 'normal'})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1">Seleccionar Plan</label>
                                    <select
                                        value={selectedPlanType}
                                        onChange={e => setSelectedPlanType(e.target.value)}
                                        className="w-full border rounded-lg p-3 text-sm font-bold"
                                        required
                                    >
                                        <option value="normal">Básico / Normal</option>
                                        <option value="pro">Pro</option>
                                        <option value="vip">Enterprise / VIP</option>
                                    </select>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition">
                                        Asignar Licencia
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
